using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Errors;
using API.Helpers;
using API.Hubs;
using AutoMapper;
using Core.Dtos.VisitorManagement;
using Core.Entities.Identity;
using Core.Entities.VisitorManagement;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VisitsController : BaseController
    {
        private readonly AppIdentityDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<VisitsController> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IWebHostEnvironment _environment;
        private readonly IMapper _mapper;

        public VisitsController(
            AppIdentityDbContext context,
            UserManager<AppUser> userManager,
            ILogger<VisitsController> logger,
            IHubContext<NotificationHub> hubContext,
            IWebHostEnvironment environment,
            IMapper mapper)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _hubContext = hubContext;
            _environment = environment;
            _mapper = mapper;
        }

        /// <summary>
        /// Get all visits (all statuses)
        /// GET /api/Visits/active?search=
        /// Returns all visits - filtering by status is done on the frontend
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<VisitDto>>> GetActiveVisits(
            [FromQuery] string? search = null)
        {
            try
            {
                _logger.LogInformation($"GetActiveVisits called with search: {search ?? "null"}");

                // Get ALL visits (no status filter - frontend will filter)
                var query = _context.Visits
                    .Include(v => v.Visitor)
                    .AsQueryable();

                // Apply search filter if provided
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(v =>
                        v.VisitNumber.Contains(search) ||
                        v.VisitorName.Contains(search) ||
                        v.DepartmentName.Contains(search) ||
                        v.EmployeeToVisit.Contains(search) ||
                        (v.CarPlate != null && v.CarPlate.Contains(search)));
                    _logger.LogInformation($"Applied search filter: {search}");
                }

                // Get all visits ordered by check-in time
                var visits = await query
                    .OrderByDescending(v => v.CheckInAt)
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {visits.Count} visits from database");

                // Map to DTOs using AutoMapper
                var visitDtos = _mapper.Map<List<VisitDto>>(visits);

                _logger.LogInformation($"Mapped to {visitDtos.Count} DTOs. Returning all visits (frontend will filter by status)");
                return Ok(visitDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visits");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visits"));
            }
        }

        /// <summary>
        /// Get visit by visit number
        /// </summary>
        [HttpGet("number/{visitNumber}")]
        public async Task<ActionResult<VisitDto>> GetVisitByNumber(string visitNumber)
        {
            try
            {
                var visit = await _context.Visits
                    .Include(v => v.Visitor)
                    .FirstOrDefaultAsync(v => v.VisitNumber == visitNumber);

                if (visit == null)
                {
                    return NotFound(new ApiResponse(404, "Visit not found"));
                }

                var visitDto = _mapper.Map<VisitDto>(visit);
                return Ok(visitDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting visit by number: {visitNumber}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visit"));
            }
        }

        /// <summary>
        /// Create a new visit (check-in)
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<VisitDto>> CreateVisit([FromBody] CreateVisitDto createDto)
        {
            try
            {
                if (createDto == null)
                {
                    return BadRequest(new ApiResponse(400, "Visit data is required"));
                }

                // Get current user
                if (User.Identity?.Name == null)
                {
                    return Unauthorized(new ApiResponse(401, "User not authenticated"));
                }

                var user = await _userManager.FindByNameAsync(User.Identity.Name);
                if (user == null)
                {
                    return Unauthorized(new ApiResponse(401, "User not found"));
                }

                // Create or find visitor
                Visitor? visitor;
                if (createDto.Visitor.Id > 0)
                {
                    visitor = await _context.Visitors.FindAsync(createDto.Visitor.Id);
                    if (visitor == null)
                    {
                        return NotFound(new ApiResponse(404, "Visitor not found"));
                    }
                }
                else
                {
                    // Check if visitor exists by NationalId or Phone
                    visitor = await _context.Visitors
                        .FirstOrDefaultAsync(v =>
                            (!string.IsNullOrEmpty(createDto.Visitor.NationalId) && v.NationalId == createDto.Visitor.NationalId) ||
                            (!string.IsNullOrEmpty(createDto.Visitor.Phone) && v.Phone == createDto.Visitor.Phone));

                    if (visitor == null)
                    {
                        // Create new visitor
                        visitor = new Visitor
                        {
                            FullName = createDto.Visitor.FullName,
                            NationalId = createDto.Visitor.NationalId,
                            Phone = createDto.Visitor.Phone,
                            Company = createDto.Visitor.Company,
                            MedicalNotes = createDto.Visitor.MedicalNotes,
                            IsBlocked = false,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        };
                        _context.Visitors.Add(visitor);
                        await _context.SaveChangesAsync();
                    }
                    else
                    {
                        // Check if visitor is blocked
                        if (visitor.IsBlocked)
                        {
                            return BadRequest(new ApiResponse(403, "Visitor is blocked and cannot create visits"));
                        }

                        // Update visitor info if provided
                        if (!string.IsNullOrEmpty(createDto.Visitor.FullName))
                            visitor.FullName = createDto.Visitor.FullName;
                        if (!string.IsNullOrEmpty(createDto.Visitor.Company))
                            visitor.Company = createDto.Visitor.Company;
                        if (!string.IsNullOrEmpty(createDto.Visitor.MedicalNotes))
                            visitor.MedicalNotes = createDto.Visitor.MedicalNotes;
                        visitor.UpdatedAt = DateTime.Now;
                    }
                }

                // Save images if provided as base64
                if (!string.IsNullOrEmpty(createDto.Visitor.PersonImageBase64))
                {
                    var personImageUrl = await ImageUploadHelper.SavePersonImageAsync(
                        createDto.Visitor.PersonImageBase64,
                        visitor.Id.ToString(),
                        _environment);
                    if (personImageUrl != null)
                        visitor.PersonImageUrl = personImageUrl;
                }

                if (!string.IsNullOrEmpty(createDto.Visitor.IdCardImageBase64))
                {
                    var idCardImageUrl = await ImageUploadHelper.SaveIdCardImageAsync(
                        createDto.Visitor.IdCardImageBase64,
                        visitor.Id.ToString(),
                        _environment);
                    if (idCardImageUrl != null)
                        visitor.IdCardImageUrl = idCardImageUrl;
                }

                await _context.SaveChangesAsync();

                // Get department name
                var department = await _context.VisitorDepartments.FindAsync(createDto.DepartmentId);
                var departmentName = department?.Name ?? "Unknown";

                // Generate visit number
                var visitNumber = await GenerateVisitNumber();

                // Save car image if provided
                string? carImageUrl = null;
                if (!string.IsNullOrEmpty(createDto.CarImageBase64))
                {
                    carImageUrl = await ImageUploadHelper.SaveCarImageAsync(
                        createDto.CarImageBase64,
                        visitNumber,
                        _environment);
                }

                // Create visit
                var visit = new Visit
                {
                    VisitNumber = visitNumber,
                    VisitorId = visitor.Id,
                    VisitorName = visitor.FullName,
                    CarPlate = createDto.CarPlate,
                    CarImageUrl = carImageUrl,
                    DepartmentId = createDto.DepartmentId,
                    DepartmentName = departmentName,
                    EmployeeToVisit = createDto.EmployeeToVisit,
                    VisitReason = createDto.VisitReason,
                    ExpectedDurationHours = createDto.ExpectedDurationHours,
                    Status = "checkedin",
                    CheckInAt = DateTime.Now,
                    CreatedByUserId = user.Id,
                    CreatedByUserName = user.CodeUser,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.Visits.Add(visit);
                await _context.SaveChangesAsync();

                // Reload to get navigation properties
                await _context.Entry(visit).Reference(v => v.Visitor).LoadAsync();

                _logger.LogInformation($"Visit created: {visit.VisitNumber} by user {user.CodeUser}");

                var visitDto = _mapper.Map<VisitDto>(visit);

                // Send SignalR notification for new visit
                await _hubContext.Clients.Group("VisitorManagement").SendAsync("VisitCreated", new
                {
                    Visit = visitDto,
                    CreatedBy = user.CodeUser,
                    Timestamp = DateTime.Now
                });

                return CreatedAtAction(nameof(GetVisitByNumber), new { visitNumber = visit.VisitNumber }, visitDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating visit");
                return StatusCode(500, new ApiResponse(500, "Error creating visit"));
            }
        }

        /// <summary>
        /// Checkout a visit
        /// </summary>
        [HttpPost("checkout/{visitNumber}")]
        public async Task<ActionResult<VisitDto>> CheckoutVisit(string visitNumber)
        {
            try
            {
                var visit = await _context.Visits
                    .Include(v => v.Visitor)
                    .FirstOrDefaultAsync(v => v.VisitNumber == visitNumber);

                if (visit == null)
                {
                    return NotFound(new ApiResponse(404, "Visit not found"));
                }

                if (visit.Status == "checkedout")
                {
                    return BadRequest(new ApiResponse(400, "Visit is already checked out"));
                }

                if (visit.Status == "rejected")
                {
                    return BadRequest(new ApiResponse(400, "Cannot checkout a rejected visit"));
                }

                visit.CheckOutAt = DateTime.Now;
                visit.Status = "checkedout";
                visit.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Visit checked out: {visit.VisitNumber}");

                var visitDto = _mapper.Map<VisitDto>(visit);

                // Send SignalR notification for visit update
                await _hubContext.Clients.Group("VisitorManagement").SendAsync("VisitUpdated", new
                {
                    Visit = visitDto,
                    Action = "checkout",
                    Timestamp = DateTime.Now
                });

                return Ok(visitDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking out visit: {visitNumber}");
                return StatusCode(500, new ApiResponse(500, "Error checking out visit"));
            }
        }

        /// <summary>
        /// Get dashboard statistics
        /// GET /api/Visits/stats
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var now = DateTime.Now;
                var todayStart = now.Date;
                var weekStart = now.AddDays(-7);
                var monthStart = now.AddMonths(-1);

                // Total counts
                var totalVisits = await _context.Visits.CountAsync();
                var totalCompleted = await _context.Visits.CountAsync(v => v.Status == "checkedout");
                var totalOngoing = await _context.Visits.CountAsync(v => v.Status == "checkedin");

                // Time-based counts
                var todayVisits = await _context.Visits
                    .CountAsync(v => v.CheckInAt >= todayStart);
                
                var weekVisits = await _context.Visits
                    .CountAsync(v => v.CheckInAt >= weekStart);
                
                var monthVisits = await _context.Visits
                    .CountAsync(v => v.CheckInAt >= monthStart);

                // Visits per department
                var visitsPerDepartment = await _context.Visits
                    .GroupBy(v => new { v.DepartmentId, v.DepartmentName })
                    .Select(g => new DepartmentVisitCountDto
                    {
                        DepartmentId = g.Key.DepartmentId,
                        DepartmentName = g.Key.DepartmentName,
                        VisitCount = g.Count()
                    })
                    .OrderByDescending(x => x.VisitCount)
                    .Take(10)
                    .ToListAsync();

                // Calculate percentages
                foreach (var dept in visitsPerDepartment)
                {
                    dept.Percentage = totalVisits > 0 
                        ? Math.Round((double)dept.VisitCount / totalVisits * 100, 2) 
                        : 0;
                }

                // Visits per user (top 5)
                var visitsPerUser = await _context.Visits
                    .GroupBy(v => new { v.CreatedByUserId, v.CreatedByUserName })
                    .Select(g => new UserVisitCountDto
                    {
                        UserId = g.Key.CreatedByUserId,
                        UserName = g.Key.CreatedByUserName,
                        VisitCount = g.Count()
                    })
                    .OrderByDescending(x => x.VisitCount)
                    .Take(5)
                    .ToListAsync();

                // Add ranks
                for (int i = 0; i < visitsPerUser.Count; i++)
                {
                    visitsPerUser[i].Rank = i + 1;
                }

                // Average duration (for completed visits)
                var completedWithDuration = await _context.Visits
                    .Where(v => v.Status == "checkedout" && v.CheckOutAt.HasValue)
                    .Select(v => new { v.CheckInAt, v.CheckOutAt })
                    .ToListAsync();

                var averageDurationMinutes = 0.0;
                if (completedWithDuration.Any())
                {
                    var totalMinutes = completedWithDuration
                        .Sum(v => (v.CheckOutAt!.Value - v.CheckInAt).TotalMinutes);
                    averageDurationMinutes = Math.Round(totalMinutes / completedWithDuration.Count, 2);
                }

                // Hourly distribution for today
                var todayVisitsGrouped = await _context.Visits
                    .Where(v => v.CheckInAt >= todayStart)
                    .Select(v => v.CheckInAt.Hour)
                    .ToListAsync();

                var hourlyDistribution = todayVisitsGrouped
                    .GroupBy(h => h)
                    .Select(g => new HourlyDistributionDto
                    {
                        Hour = $"{g.Key:D2}:00",
                        Count = g.Count(),
                        Percentage = todayVisits > 0 
                            ? Math.Round((double)g.Count() / todayVisits * 100, 2) 
                            : 0
                    })
                    .OrderBy(h => h.Hour)
                    .ToList();

                var stats = new DashboardStatsDto
                {
                    TotalVisits = totalVisits,
                    TotalCompleted = totalCompleted,
                    TotalOngoing = totalOngoing,
                    TodayVisits = todayVisits,
                    WeekVisits = weekVisits,
                    MonthVisits = monthVisits,
                    VisitsPerDepartment = visitsPerDepartment,
                    VisitsPerUser = visitsPerUser,
                    AverageDurationMinutes = averageDurationMinutes,
                    HourlyDistribution = hourlyDistribution
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, new ApiResponse(500, "Error retrieving dashboard stats"));
            }
        }

        /// <summary>
        /// Get recent visits
        /// GET /api/Visits/recent?count=10
        /// </summary>
        [HttpGet("recent")]
        public async Task<ActionResult<List<VisitDto>>> GetRecentVisits([FromQuery] int count = 10)
        {
            try
            {
                if (count < 1 || count > 100)
                {
                    return BadRequest(new ApiResponse(400, "Count must be between 1 and 100"));
                }

                var visits = await _context.Visits
                    .Include(v => v.Visitor)
                    .OrderByDescending(v => v.CheckInAt)
                    .Take(count)
                    .ToListAsync();

                var visitDtos = _mapper.Map<List<VisitDto>>(visits);
                return Ok(visitDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent visits");
                return StatusCode(500, new ApiResponse(500, "Error retrieving recent visits"));
            }
        }

        /// <summary>
        /// Get visit history (completed visits)
        /// GET /api/Visits/history?search=&status=completed&departmentId=&dateFrom=&dateTo=
        /// </summary>
        [HttpGet("history")]
        public async Task<ActionResult<List<VisitDto>>> GetVisitHistory(
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            try
            {
                var query = _context.Visits
                    .Include(v => v.Visitor)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(v =>
                        v.VisitNumber.Contains(search) ||
                        v.VisitorName.Contains(search) ||
                        v.DepartmentName.Contains(search) ||
                        v.EmployeeToVisit.Contains(search) ||
                        (v.CarPlate != null && v.CarPlate.Contains(search)));
                }

                if (!string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(v => v.Status == status);
                }

                if (departmentId.HasValue)
                {
                    query = query.Where(v => v.DepartmentId == departmentId.Value);
                }

                if (dateFrom.HasValue)
                {
                    query = query.Where(v => v.CheckInAt >= dateFrom.Value);
                }

                if (dateTo.HasValue)
                {
                    var dateToEnd = dateTo.Value.Date.AddDays(1);
                    query = query.Where(v => v.CheckInAt < dateToEnd);
                }

                var visits = await query
                    .OrderByDescending(v => v.CheckInAt)
                    .ToListAsync();

                var visitDtos = _mapper.Map<List<VisitDto>>(visits);
                return Ok(visitDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visit history");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visit history"));
            }
        }

        /// <summary>
        /// Get visits by time period (today, week, month)
        /// GET /api/Visits/by-period?period=today
        /// </summary>
        [HttpGet("by-period")]
        public async Task<ActionResult<List<VisitDto>>> GetVisitsByPeriod(
            [FromQuery] string period = "today")
        {
            try
            {
                var now = DateTime.Now;
                DateTime startDate;

                switch (period.ToLower())
                {
                    case "today":
                        startDate = now.Date;
                        break;
                    case "yesterday":
                        startDate = now.Date.AddDays(-1);
                        break;
                    case "week":
                        startDate = now.AddDays(-7);
                        break;
                    case "month":
                        startDate = now.AddMonths(-1);
                        break;
                    default:
                        return BadRequest(new ApiResponse(400, "Invalid period. Use: today, yesterday, week, or month"));
                }

                var visits = await _context.Visits
                    .Include(v => v.Visitor)
                    .Where(v => v.CheckInAt >= startDate)
                    .OrderByDescending(v => v.CheckInAt)
                    .ToListAsync();

                var visitDtos = _mapper.Map<List<VisitDto>>(visits);
                return Ok(visitDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting visits by period: {period}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visits"));
            }
        }

        /// <summary>
        /// Generate unique visit number
        /// </summary>
        private async Task<string> GenerateVisitNumber()
        {
            var today = DateTime.Now;
            var prefix = $"V{today:yyyyMMdd}";

            // Get today's visit count
            var todayStart = today.Date;
            var todayEnd = todayStart.AddDays(1);
            var count = await _context.Visits
                .Where(v => v.CreatedAt >= todayStart && v.CreatedAt < todayEnd)
                .CountAsync();

            return $"{prefix}-{(count + 1):D4}";
        }

        /// <summary>
        /// Reject a visit
        /// </summary>
        [HttpPost("{visitNumber}/reject")]
        public async Task<ActionResult<VisitDto>> RejectVisit(string visitNumber, [FromBody] RejectVisitDto rejectDto)
        {
            try
            {
                var visit = await _context.Visits
                    .Include(v => v.Visitor)
                    .FirstOrDefaultAsync(v => v.VisitNumber == visitNumber);

                if (visit == null)
                {
                    return NotFound(new ApiResponse(404, "Visit not found"));
                }

                if (visit.Status == "rejected")
                {
                    return BadRequest(new ApiResponse(400, "Visit is already rejected"));
                }

                // Get current user
                if (User.Identity?.Name == null)
                {
                    return Unauthorized(new ApiResponse(401, "User not authenticated"));
                }

                var user = await _userManager.FindByNameAsync(User.Identity.Name);
                if (user == null)
                {
                    return Unauthorized(new ApiResponse(401, "User not found"));
                }

                visit.Status = "rejected";
                visit.RejectionReason = rejectDto.RejectionReason;
                visit.RejectedAt = DateTime.Now;
                visit.RejectedByUserId = user.Id;
                visit.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Visit rejected: {visit.VisitNumber} by user {user.CodeUser}");

                var visitDto = _mapper.Map<VisitDto>(visit);

                // Send SignalR notification
                await _hubContext.Clients.Group("VisitorManagement").SendAsync("VisitUpdated", new
                {
                    Visit = visitDto,
                    Action = "reject",
                    Timestamp = DateTime.Now
                });

                return Ok(visitDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error rejecting visit: {visitNumber}");
                return StatusCode(500, new ApiResponse(500, "Error rejecting visit"));
            }
        }
    }
}

