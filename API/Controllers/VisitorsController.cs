using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using API.Errors;
using Core.Dtos.VisitorManagement;
using Core.Entities.VisitorManagement;
using Core.Entities.Identity;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using API.Hubs;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VisitorsController : BaseController
    {
        private readonly AppIdentityDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<VisitorsController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<NotificationHub> _hubContext;

        public VisitorsController(
            AppIdentityDbContext context,
            UserManager<AppUser> userManager,
            ILogger<VisitorsController> logger,
            IConfiguration configuration,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _configuration = configuration;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Get visitor by National ID or Phone
        /// </summary>
        [HttpGet("lookup")]
        public async Task<ActionResult<VisitorDto>> GetVisitorByIdentifier(
            [FromQuery] string? nationalId = null,
            [FromQuery] string? phone = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nationalId) && string.IsNullOrWhiteSpace(phone))
                {
                    return BadRequest(new ApiResponse(400, "National ID or Phone is required"));
                }

                var visitor = await _context.Visitors
                    .FirstOrDefaultAsync(v =>
                        (!string.IsNullOrWhiteSpace(nationalId) && v.NationalId == nationalId) ||
                        (!string.IsNullOrWhiteSpace(phone) && v.Phone == phone));

                if (visitor == null)
                {
                    return NotFound(new ApiResponse(404, "Visitor not found"));
                }

                var visitorDto = new VisitorDto
                {
                    Id = visitor.Id,
                    FullName = visitor.FullName,
                    NationalId = visitor.NationalId,
                    Phone = visitor.Phone,
                    Company = visitor.Company,
                    MedicalNotes = visitor.MedicalNotes,
                    PersonImageUrl = ResolveImageUrl(visitor.PersonImageUrl),
                    IdCardImageUrl = ResolveImageUrl(visitor.IdCardImageUrl),
                    IsBlocked = visitor.IsBlocked,
                    CreatedAt = visitor.CreatedAt
                };

                return Ok(visitorDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visitor by identifier");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visitor"));
            }
        }

        /// <summary>
        /// Search visitors by name, National ID, Phone, or Company
        /// GET /api/Visitors/search?query=name
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<List<VisitorDto>>> SearchVisitors(
            [FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return BadRequest(new ApiResponse(400, "Search query is required"));
                }

                var searchTerm = query.Trim().ToLower();
                var visitors = await _context.Visitors
                    .Where(v =>
                        v.FullName.ToLower().Contains(searchTerm) ||
                        (v.NationalId != null && v.NationalId.Contains(searchTerm)) ||
                        (v.Phone != null && v.Phone.Contains(searchTerm)) ||
                        (v.Company != null && v.Company.ToLower().Contains(searchTerm)))
                    .OrderBy(v => v.FullName)
                    .Take(50)
                    .ToListAsync();

                // Resolve image URLs after fetching (can't use ResolveImageUrl in LINQ to SQL)
                var visitorDtos = visitors.Select(v => new VisitorDto
                {
                    Id = v.Id,
                    FullName = v.FullName,
                    NationalId = v.NationalId,
                    Phone = v.Phone,
                    Company = v.Company,
                    MedicalNotes = v.MedicalNotes,
                    PersonImageUrl = ResolveImageUrl(v.PersonImageUrl),
                    IdCardImageUrl = ResolveImageUrl(v.IdCardImageUrl),
                    IsBlocked = v.IsBlocked,
                    CreatedAt = v.CreatedAt
                }).ToList();

                return Ok(visitorDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching visitors");
                return StatusCode(500, new ApiResponse(500, "Error searching visitors"));
            }
        }

        /// <summary>
        /// Get all visitors with optional department filter
        /// GET /api/Visitors?departmentId=1&search=
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VisitorListItemDto>>> GetVisitors(
            [FromQuery] int? departmentId = null,
            [FromQuery] string? search = null)
        {
            try
            {
                var query = _context.Visitors.AsQueryable();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var searchTerm = search.Trim().ToLower();
                    query = query.Where(v =>
                        v.FullName.ToLower().Contains(searchTerm) ||
                        (v.NationalId != null && v.NationalId.Contains(searchTerm)) ||
                        (v.Phone != null && v.Phone.Contains(searchTerm)) ||
                        (v.Company != null && v.Company.ToLower().Contains(searchTerm)));
                }

                // Apply department filter (visitors who have visited this department)
                if (departmentId.HasValue)
                {
                    var visitorIdsInDepartment = await _context.Visits
                        .Where(v => v.DepartmentId == departmentId.Value)
                        .Select(v => v.VisitorId)
                        .Distinct()
                        .ToListAsync();
                    
                    query = query.Where(v => visitorIdsInDepartment.Contains(v.Id));
                }

                var visitors = await query
                    .Select(v => new VisitorListItemDto
                    {
                        Id = v.Id,
                        FullName = v.FullName,
                        NationalId = v.NationalId,
                        Phone = v.Phone,
                        Company = v.Company,
                        ProfileImageUrl = v.PersonImageUrl,
                        IsBlocked = v.IsBlocked,
                        CreatedAt = v.CreatedAt
                    })
                    .OrderBy(v => v.FullName)
                    .ToListAsync();

                // Get statistics for each visitor
                var visitorIds = visitors.Select(v => v.Id).ToList();
                var visitStats = await _context.Visits
                    .Where(v => visitorIds.Contains(v.VisitorId))
                    .GroupBy(v => v.VisitorId)
                    .Select(g => new
                    {
                        VisitorId = g.Key,
                        TotalVisits = g.Count(),
                        LastVisitDate = g.Max(v => v.CheckInAt)
                    })
                    .ToListAsync();

                // Get first visit person image for profile image
                var firstVisits = await _context.Visits
                    .Where(v => visitorIds.Contains(v.VisitorId))
                    .OrderBy(v => v.CheckInAt)
                    .GroupBy(v => v.VisitorId)
                    .Select(g => new
                    {
                        VisitorId = g.Key,
                        FirstVisit = g.First()
                    })
                    .ToListAsync();

                // Get visitor images for profile
                var visitorImages = await _context.Visitors
                    .Where(v => visitorIds.Contains(v.Id))
                    .Select(v => new
                    {
                        v.Id,
                        v.PersonImageUrl
                    })
                    .ToListAsync();

                // Combine data
                foreach (var visitor in visitors)
                {
                    var stats = visitStats.FirstOrDefault(s => s.VisitorId == visitor.Id);
                    if (stats != null)
                    {
                        visitor.TotalVisits = stats.TotalVisits;
                        visitor.LastVisitDate = stats.LastVisitDate;
                    }

                    // Set profile image (first visit person image or current person image)
                    var image = visitorImages.FirstOrDefault(i => i.Id == visitor.Id);
                    if (image != null && !string.IsNullOrEmpty(image.PersonImageUrl))
                    {
                        visitor.ProfileImageUrl = ResolveImageUrl(image.PersonImageUrl);
                    }
                }

                return Ok(visitors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visitors");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visitors"));
            }
        }

        /// <summary>
        /// Get comprehensive visitor profile with visit history, statistics, and image gallery
        /// GET /api/Visitors/{id}/profile
        /// </summary>
        [HttpGet("{id}/profile")]
        public async Task<ActionResult<VisitorProfileDto>> GetVisitorProfile(int id)
        {
            try
            {
                var visitor = await _context.Visitors.FindAsync(id);
                if (visitor == null)
                {
                    return NotFound(new ApiResponse(404, "Visitor not found"));
                }

                // Get all visits for this visitor
                var visits = await _context.Visits
                    .Where(v => v.VisitorId == id)
                    .OrderBy(v => v.CheckInAt)
                    .ToListAsync();

                // Get first visit (for profile image)
                var firstVisit = visits.FirstOrDefault();

                // Build visitor DTO
                var visitorDto = new VisitorDto
                {
                    Id = visitor.Id,
                    FullName = visitor.FullName,
                    NationalId = visitor.NationalId,
                    Phone = visitor.Phone,
                    Company = visitor.Company,
                    MedicalNotes = visitor.MedicalNotes,
                    PersonImageUrl = ResolveImageUrl(visitor.PersonImageUrl),
                    IdCardImageUrl = ResolveImageUrl(visitor.IdCardImageUrl),
                    IsBlocked = visitor.IsBlocked,
                    CreatedAt = visitor.CreatedAt
                };

                // Calculate statistics
                var totalVisits = visits.Count;
                var completedVisits = visits.Count(v => v.Status == "checkedout");
                var ongoingVisits = visits.Count(v => v.Status == "checkedin");
                var firstVisitDate = visits.Any() ? (DateTime?)visits.Min(v => v.CheckInAt) : null;
                var lastVisitDate = visits.Any() ? (DateTime?)visits.Max(v => v.CheckInAt) : null;

                // Calculate average duration
                double? avgDuration = null;
                var completedVisitsWithDuration = visits
                    .Where(v => v.Status == "checkedout" && v.CheckOutAt.HasValue)
                    .ToList();
                if (completedVisitsWithDuration.Any())
                {
                    var totalMinutes = completedVisitsWithDuration
                        .Sum(v => (v.CheckOutAt!.Value - v.CheckInAt).TotalMinutes);
                    avgDuration = totalMinutes / completedVisitsWithDuration.Count;
                }

                // Build image gallery
                var imageGallery = new List<VisitorImageDto>();

                // Add person image from first visit (if exists)
                if (firstVisit != null && !string.IsNullOrEmpty(visitor.PersonImageUrl))
                {
                    imageGallery.Add(new VisitorImageDto
                    {
                        ImageUrl = ResolveImageUrl(visitor.PersonImageUrl),
                        ImageType = ImageType.Person,
                        VisitNumber = firstVisit.VisitNumber,
                        VisitDate = firstVisit.CheckInAt,
                        VisitInfo = $"First visit to {firstVisit.DepartmentName}"
                    });
                }

                // Add ID card image
                if (!string.IsNullOrEmpty(visitor.IdCardImageUrl))
                {
                    var idCardVisit = firstVisit ?? visits.FirstOrDefault();
                    if (idCardVisit != null)
                    {
                        imageGallery.Add(new VisitorImageDto
                        {
                            ImageUrl = ResolveImageUrl(visitor.IdCardImageUrl),
                            ImageType = ImageType.IdCard,
                            VisitNumber = idCardVisit.VisitNumber,
                            VisitDate = idCardVisit.CheckInAt,
                            VisitInfo = $"ID Card - Visit to {idCardVisit.DepartmentName}"
                        });
                    }
                }

                // Add all car images from visits
                foreach (var visit in visits.Where(v => !string.IsNullOrEmpty(v.CarImageUrl)))
                {
                    imageGallery.Add(new VisitorImageDto
                    {
                        ImageUrl = ResolveImageUrl(visit.CarImageUrl),
                        ImageType = ImageType.Car,
                        VisitNumber = visit.VisitNumber,
                        VisitDate = visit.CheckInAt,
                        VisitInfo = $"Visit to {visit.DepartmentName} - {visit.EmployeeToVisit}",
                        CarPlate = visit.CarPlate
                    });
                }

                // Build visit history
                var visitHistory = visits
                    .OrderByDescending(v => v.CheckInAt)
                    .Select(v => new VisitHistoryItemDto
                    {
                        Id = v.Id,
                        VisitNumber = v.VisitNumber,
                        DepartmentId = v.DepartmentId,
                        DepartmentName = v.DepartmentName,
                        EmployeeToVisit = v.EmployeeToVisit,
                        VisitReason = v.VisitReason,
                        Status = v.Status,
                        CheckInAt = v.CheckInAt,
                        CheckOutAt = v.CheckOutAt,
                        DurationMinutes = v.CheckOutAt.HasValue
                            ? (int?)(v.CheckOutAt.Value - v.CheckInAt).TotalMinutes
                            : null,
                        CarPlate = v.CarPlate,
                        CarImageUrl = ResolveImageUrl(v.CarImageUrl)
                    })
                    .ToList();

                // Calculate department statistics
                var deptStats = visits
                    .GroupBy(v => new { v.DepartmentId, v.DepartmentName })
                    .Select(g => new DepartmentVisitStatsDto
                    {
                        DepartmentId = g.Key.DepartmentId,
                        DepartmentName = g.Key.DepartmentName,
                        VisitCount = g.Count(),
                        Percentage = totalVisits > 0 ? (g.Count() * 100.0 / totalVisits) : 0
                    })
                    .OrderByDescending(d => d.VisitCount)
                    .ToList();

                // Build profile
                var profile = new VisitorProfileDto
                {
                    Visitor = visitorDto,
                    TotalVisits = totalVisits,
                    CompletedVisits = completedVisits,
                    OngoingVisits = ongoingVisits,
                    FirstVisitDate = firstVisitDate,
                    LastVisitDate = lastVisitDate,
                    AverageVisitDurationMinutes = avgDuration,
                    ProfileImageUrl = firstVisit != null && !string.IsNullOrEmpty(visitor.PersonImageUrl)
                        ? ResolveImageUrl(visitor.PersonImageUrl)
                        : null,
                    ImageGallery = imageGallery.OrderByDescending(i => i.VisitDate).ToList(),
                    VisitHistory = visitHistory,
                    DepartmentStats = deptStats
                };

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting visitor profile: {id}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visitor profile"));
            }
        }

        /// <summary>
        /// Resolve relative image path to full URL
        /// </summary>
        private string? ResolveImageUrl(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            // If already a full URL, return as is
            if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
                return imagePath;

            // Get base URL from configuration
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";

            baseUrl = baseUrl.TrimEnd('/');
            imagePath = imagePath.TrimStart('/');

            return $"{baseUrl}/{imagePath}";
        }

        /// <summary>
        /// Update visitor blocked status
        /// </summary>
        [HttpPut("{id}/block")]
        public async Task<ActionResult<VisitorDto>> UpdateBlockStatus(int id, [FromBody] BlockVisitorDto blockDto)
        {
            try
            {
                var visitor = await _context.Visitors.FindAsync(id);
                if (visitor == null)
                {
                    return NotFound(new ApiResponse(404, "Visitor not found"));
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

                visitor.IsBlocked = blockDto.IsBlocked;
                visitor.UpdatedAt = DateTime.Now;

                if (blockDto.IsBlocked)
                {
                    visitor.BlockReason = blockDto.BlockReason;
                    visitor.BlockedAt = DateTime.Now;
                    visitor.BlockedByUserId = user.Id;
                }
                else
                {
                    // Unblocking - clear block info
                    visitor.BlockReason = null;
                    visitor.BlockedAt = null;
                    visitor.BlockedByUserId = null;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Visitor {visitor.FullName} (ID: {id}) {(blockDto.IsBlocked ? "blocked" : "unblocked")} by user {user.CodeUser}");

                // Send SignalR notification for visitor block/unblock
                await _hubContext.Clients.Group("VisitorManagement").SendAsync("VisitorBlocked", new
                {
                    VisitorId = visitor.Id,
                    VisitorName = visitor.FullName,
                    IsBlocked = blockDto.IsBlocked,
                    BlockReason = blockDto.BlockReason,
                    BlockedBy = user.CodeUser,
                    Timestamp = DateTime.Now,
                    Message = blockDto.IsBlocked 
                        ? $"Visitor {visitor.FullName} has been blocked. Please call them to leave the premises immediately."
                        : $"Visitor {visitor.FullName} has been unblocked."
                });

                var visitorDto = new VisitorDto
                {
                    Id = visitor.Id,
                    FullName = visitor.FullName,
                    NationalId = visitor.NationalId,
                    Phone = visitor.Phone,
                    Company = visitor.Company,
                    MedicalNotes = visitor.MedicalNotes,
                    PersonImageUrl = ResolveImageUrl(visitor.PersonImageUrl),
                    IdCardImageUrl = ResolveImageUrl(visitor.IdCardImageUrl),
                    IsBlocked = visitor.IsBlocked,
                    CreatedAt = visitor.CreatedAt
                };

                return Ok(visitorDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating visitor block status: {id}");
                return StatusCode(500, new ApiResponse(500, "Error updating visitor block status"));
            }
        }
    }
}

