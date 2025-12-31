using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Errors;
using Core.Dtos.VisitorManagement;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VisitReportsController : BaseController
    {
        private readonly AppIdentityDbContext _context;
        private readonly ILogger<VisitReportsController> _logger;
        private readonly IConfiguration _configuration;

        public VisitReportsController(
            AppIdentityDbContext context,
            ILogger<VisitReportsController> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
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
        /// Get visit summary report for a date range
        /// </summary>
        /// <param name="fromDate">Start date (YYYY-MM-DD)</param>
        /// <param name="toDate">End date (YYYY-MM-DD)</param>
        [HttpGet("summary")]
        public async Task<ActionResult<VisitSummaryDto>> GetSummaryReport(
            [FromQuery] string fromDate,
            [FromQuery] string toDate)
        {
            try
            {
                if (!DateTime.TryParse(fromDate, out var startDate) ||
                    !DateTime.TryParse(toDate, out var endDate))
                {
                    return BadRequest(new ApiResponse(400, "Invalid date format. Use YYYY-MM-DD"));
                }

                // Ensure dates are at start and end of day
                startDate = startDate.Date;
                endDate = endDate.Date.AddDays(1).AddSeconds(-1);

                // Get visits in date range
                var visits = await _context.Visits
                    .Where(v => v.CheckInAt >= startDate && v.CheckInAt <= endDate)
                    .ToListAsync();

                // Calculate totals
                var totalVisits = visits.Count;
                var totalCompleted = visits.Count(v => v.Status == "checkedout");
                var totalOngoing = visits.Count(v => v.Status == "checkedin");

                // Visits per department
                var visitsPerDepartment = visits
                    .GroupBy(v => new { v.DepartmentId, v.DepartmentName })
                    .Select(g => new DepartmentVisitCountDto
                    {
                        DepartmentId = g.Key.DepartmentId,
                        DepartmentName = g.Key.DepartmentName,
                        VisitCount = g.Count()
                    })
                    .OrderByDescending(d => d.VisitCount)
                    .ToArray();

                // Visits per user (who created the visit)
                var visitsPerUser = visits
                    .GroupBy(v => new { v.CreatedByUserId, v.CreatedByUserName })
                    .Select(g => new UserVisitCountDto
                    {
                        UserId = g.Key.CreatedByUserId,
                        UserName = g.Key.CreatedByUserName,
                        VisitCount = g.Count()
                    })
                    .OrderByDescending(u => u.VisitCount)
                    .ToArray();

                var summary = new VisitSummaryDto
                {
                    TotalVisits = totalVisits,
                    TotalCompleted = totalCompleted,
                    TotalOngoing = totalOngoing,
                    VisitsPerDepartment = visitsPerDepartment,
                    VisitsPerUser = visitsPerUser
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visit summary report");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visit summary"));
            }
        }

        /// <summary>
        /// Get all visits with filtering
        /// </summary>
        [HttpGet("visits")]
        public async Task<ActionResult<IEnumerable<VisitDto>>> GetVisitsReport(
            [FromQuery] string? fromDate = null,
            [FromQuery] string? toDate = null,
            [FromQuery] string? status = null,
            [FromQuery] int? departmentId = null)
        {
            try
            {
                var query = _context.Visits.Include(v => v.Visitor).AsQueryable();

                // Filter by date range
                if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out var startDate))
                {
                    query = query.Where(v => v.CheckInAt >= startDate.Date);
                }

                if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out var endDate))
                {
                    var endOfDay = endDate.Date.AddDays(1).AddSeconds(-1);
                    query = query.Where(v => v.CheckInAt <= endOfDay);
                }

                // Filter by status
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(v => v.Status == status);
                }

                // Filter by department
                if (departmentId.HasValue)
                {
                    query = query.Where(v => v.DepartmentId == departmentId.Value);
                }

                var visits = await query
                    .OrderByDescending(v => v.CheckInAt)
                    .ToListAsync();

                // Resolve image URLs after fetching (can't use ResolveImageUrl in LINQ to SQL)
                var visitDtos = visits.Select(v => new VisitDto
                {
                    Id = v.Id,
                    VisitNumber = v.VisitNumber,
                    VisitorId = v.VisitorId,
                    VisitorName = v.VisitorName,
                    CarPlate = v.CarPlate,
                    CarImageUrl = ResolveImageUrl(v.CarImageUrl),
                    DepartmentId = v.DepartmentId,
                    DepartmentName = v.DepartmentName,
                    EmployeeToVisit = v.EmployeeToVisit,
                    VisitReason = v.VisitReason,
                    ExpectedDurationHours = v.ExpectedDurationHours,
                    Status = v.Status,
                    CheckInAt = v.CheckInAt,
                    CheckOutAt = v.CheckOutAt,
                    CreatedByUserId = v.CreatedByUserId,
                    CreatedByUserName = v.CreatedByUserName,
                    CreatedAt = v.CreatedAt
                }).ToList();

                return Ok(visitDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visits report");
                return StatusCode(500, new ApiResponse(500, "Error retrieving visits"));
            }
        }

        /// <summary>
        /// Get daily visit statistics for the last N days
        /// </summary>
        [HttpGet("daily-stats")]
        public async Task<ActionResult<object>> GetDailyStats([FromQuery] int days = 7)
        {
            try
            {
                var startDate = DateTime.UtcNow.Date.AddDays(-days);
                var visits = await _context.Visits
                    .Where(v => v.CheckInAt >= startDate)
                    .ToListAsync();

                var dailyStats = visits
                    .GroupBy(v => v.CheckInAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Total = g.Count(),
                        Completed = g.Count(v => v.Status == "checkedout"),
                        Ongoing = g.Count(v => v.Status == "checkedin"),
                        Incomplete = g.Count(v => v.Status == "incomplete")
                    })
                    .OrderBy(s => s.Date)
                    .ToList();

                return Ok(dailyStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily stats");
                return StatusCode(500, new ApiResponse(500, "Error retrieving daily statistics"));
            }
        }

        /// <summary>
        /// Get top visitors (most frequent)
        /// </summary>
        [HttpGet("top-visitors")]
        public async Task<ActionResult<object>> GetTopVisitors([FromQuery] int top = 10)
        {
            try
            {
                var topVisitors = await _context.Visits
                    .GroupBy(v => new { v.VisitorId, v.VisitorName })
                    .Select(g => new
                    {
                        VisitorId = g.Key.VisitorId,
                        VisitorName = g.Key.VisitorName,
                        VisitCount = g.Count(),
                        LastVisit = g.Max(v => v.CheckInAt)
                    })
                    .OrderByDescending(v => v.VisitCount)
                    .Take(top)
                    .ToListAsync();

                return Ok(topVisitors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top visitors");
                return StatusCode(500, new ApiResponse(500, "Error retrieving top visitors"));
            }
        }
    }
}

