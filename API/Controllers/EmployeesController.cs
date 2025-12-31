using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using API.Errors;
using API.Helpers;
using API.Hubs;
using AutoMapper;
using Core.Dtos.VisitorManagement;
using Core.Entities.VisitorManagement;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : BaseController
    {
        private readonly AppIdentityDbContext _context;
        private readonly ILogger<EmployeesController> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public EmployeesController(
            AppIdentityDbContext context,
            ILogger<EmployeesController> logger,
            IWebHostEnvironment environment,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Get all employees
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees(
            [FromQuery] string? search = null,
            [FromQuery] int? departmentId = null)
        {
            try
            {
                var query = _context.Employees
                    .Include(e => e.Department)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(e =>
                        e.EmployeeId.Contains(search) ||
                        e.EmployeeName.Contains(search));
                }

                if (departmentId.HasValue)
                {
                    query = query.Where(e => e.DepartmentId == departmentId.Value);
                }

                var employees = await query
                    .OrderBy(e => e.EmployeeName)
                    .ToListAsync();

                var employeeDtos = _mapper.Map<List<EmployeeDto>>(employees);
                return Ok(employeeDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting employees");
                return StatusCode(500, new ApiResponse(500, "Error retrieving employees"));
            }
        }

        /// <summary>
        /// Get employee by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.Department)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (employee == null)
                {
                    return NotFound(new ApiResponse(404, "Employee not found"));
                }

                var employeeDto = _mapper.Map<EmployeeDto>(employee);
                return Ok(employeeDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting employee: {id}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving employee"));
            }
        }

        /// <summary>
        /// Get employee by EmployeeId (barcode) or name
        /// </summary>
        [HttpGet("lookup")]
        public async Task<ActionResult<EmployeeDto>> GetEmployeeByIdentifier(
            [FromQuery] string? employeeId = null,
            [FromQuery] string? name = null)
        {
            try
            {
                Employee? employee = null;

                if (!string.IsNullOrWhiteSpace(employeeId))
                {
                    employee = await _context.Employees
                        .Include(e => e.Department)
                        .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
                }

                if (employee == null && !string.IsNullOrWhiteSpace(name))
                {
                    employee = await _context.Employees
                        .Include(e => e.Department)
                        .FirstOrDefaultAsync(e => e.EmployeeName.Contains(name));
                }

                if (employee == null)
                {
                    return NotFound(new ApiResponse(404, "Employee not found"));
                }

                var employeeDto = _mapper.Map<EmployeeDto>(employee);
                return Ok(employeeDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error looking up employee");
                return StatusCode(500, new ApiResponse(500, "Error looking up employee"));
            }
        }

        /// <summary>
        /// Create new employee
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] CreateEmployeeDto createDto)
        {
            try
            {
                if (createDto == null)
                {
                    return BadRequest(new ApiResponse(400, "Employee data is required"));
                }

                // Check if EmployeeId already exists
                var existing = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeId == createDto.EmployeeId);

                if (existing != null)
                {
                    return BadRequest(new ApiResponse(400, "Employee with this ID already exists"));
                }

                var employee = new Employee
                {
                    EmployeeId = createDto.EmployeeId,
                    EmployeeName = createDto.EmployeeName,
                    DepartmentId = createDto.DepartmentId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true
                };

                // Save images if provided
                if (!string.IsNullOrEmpty(createDto.CardImageBase64))
                {
                    var cardImageUrl = await ImageUploadHelper.SaveEmployeeCardImageAsync(
                        createDto.CardImageBase64,
                        createDto.EmployeeId,
                        _environment);
                    if (cardImageUrl != null)
                        employee.CardImageUrl = cardImageUrl;
                }

                if (!string.IsNullOrEmpty(createDto.FaceImageBase64))
                {
                    var faceImageUrl = await ImageUploadHelper.SaveEmployeeFaceImageAsync(
                        createDto.FaceImageBase64,
                        createDto.EmployeeId,
                        _environment);
                    if (faceImageUrl != null)
                        employee.FaceImageUrl = faceImageUrl;
                }

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                await _context.Entry(employee).Reference(e => e.Department).LoadAsync();

                _logger.LogInformation($"Employee created: {employee.EmployeeId} - {employee.EmployeeName}");

                var employeeDto = _mapper.Map<EmployeeDto>(employee);
                return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employeeDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee");
                return StatusCode(500, new ApiResponse(500, "Error creating employee"));
            }
        }

        /// <summary>
        /// Update employee
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<EmployeeDto>> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto updateDto)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.Department)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (employee == null)
                {
                    return NotFound(new ApiResponse(404, "Employee not found"));
                }

                // Update fields
                if (!string.IsNullOrEmpty(updateDto.EmployeeName))
                    employee.EmployeeName = updateDto.EmployeeName;

                if (updateDto.DepartmentId.HasValue)
                    employee.DepartmentId = updateDto.DepartmentId.Value;

                if (updateDto.IsActive.HasValue)
                    employee.IsActive = updateDto.IsActive.Value;

                employee.UpdatedAt = DateTime.Now;

                // Update images if provided
                if (!string.IsNullOrEmpty(updateDto.CardImageBase64))
                {
                    var cardImageUrl = await ImageUploadHelper.SaveEmployeeCardImageAsync(
                        updateDto.CardImageBase64,
                        employee.EmployeeId,
                        _environment);
                    if (cardImageUrl != null)
                        employee.CardImageUrl = cardImageUrl;
                }

                if (!string.IsNullOrEmpty(updateDto.FaceImageBase64))
                {
                    var faceImageUrl = await ImageUploadHelper.SaveEmployeeFaceImageAsync(
                        updateDto.FaceImageBase64,
                        employee.EmployeeId,
                        _environment);
                    if (faceImageUrl != null)
                        employee.FaceImageUrl = faceImageUrl;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Employee updated: {employee.EmployeeId} - {employee.EmployeeName}");

                var employeeDto = _mapper.Map<EmployeeDto>(employee);
                return Ok(employeeDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating employee: {id}");
                return StatusCode(500, new ApiResponse(500, "Error updating employee"));
            }
        }

        /// <summary>
        /// Delete employee
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            try
            {
                var employee = await _context.Employees.FindAsync(id);
                if (employee == null)
                {
                    return NotFound(new ApiResponse(404, "Employee not found"));
                }

                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Employee deleted: {employee.EmployeeId} - {employee.EmployeeName}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting employee: {id}");
                return StatusCode(500, new ApiResponse(500, "Error deleting employee"));
            }
        }

        /// <summary>
        /// Record employee attendance (check-in)
        /// </summary>
        [HttpPost("attendance/checkin")]
        public async Task<ActionResult<EmployeeAttendanceDto>> CheckIn([FromBody] CreateEmployeeAttendanceDto createDto)
        {
            try
            {
                // Find employee by ID or name
                Employee? employee = null;
                
                if (!string.IsNullOrWhiteSpace(createDto.EmployeeIdOrName))
                {
                    // Try as EmployeeId first
                    employee = await _context.Employees
                        .Include(e => e.Department)
                        .FirstOrDefaultAsync(e => e.EmployeeId == createDto.EmployeeIdOrName);

                    // If not found, try by name
                    if (employee == null)
                    {
                        employee = await _context.Employees
                            .Include(e => e.Department)
                            .FirstOrDefaultAsync(e => e.EmployeeName.Contains(createDto.EmployeeIdOrName));
                    }
                }

                if (employee == null)
                {
                    return NotFound(new ApiResponse(404, "Employee not found"));
                }

                if (!employee.IsActive)
                {
                    return BadRequest(new ApiResponse(400, "Employee is not active"));
                }

                var todayStart = DateTime.Now.Date;
                var todayEnd = todayStart.AddDays(1);

                // Check if employee has an open attendance today (checked in but not checked out)
                var openAttendanceToday = await _context.EmployeeAttendances
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .Where(a => a.EmployeeId == employee.Id 
                        && !a.CheckOutTime.HasValue
                        && a.CheckInTime >= todayStart 
                        && a.CheckInTime < todayEnd)
                    .OrderByDescending(a => a.CheckInTime)
                    .FirstOrDefaultAsync();

                // If already checked in today, set checkout time (leave time)
                if (openAttendanceToday != null)
                {
                    openAttendanceToday.CheckOutTime = DateTime.Now;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Employee checked out: {employee.EmployeeId} - {employee.EmployeeName}");

                    var checkoutDto = _mapper.Map<EmployeeAttendanceDto>(openAttendanceToday);

                    // Send SignalR notification for employee attendance update
                    await _hubContext.Clients.Group("EmployeeManagement").SendAsync("EmployeeAttendanceUpdated", new
                    {
                        Attendance = checkoutDto,
                        EmployeeName = employee.EmployeeName,
                        EmployeeId = employee.EmployeeId,
                        Action = "CheckedOut",
                        Timestamp = DateTime.Now
                    });

                    return Ok(checkoutDto);
                }

                // Check for any open attendance from previous days and close it automatically
                var openAttendance = await _context.EmployeeAttendances
                    .Include(a => a.Employee)
                    .Where(a => a.EmployeeId == employee.Id && !a.CheckOutTime.HasValue)
                    .OrderByDescending(a => a.CheckInTime)
                    .FirstOrDefaultAsync();

                if (openAttendance != null)
                {
                    // Automatically check out the previous attendance
                    openAttendance.CheckOutTime = DateTime.Now;
                    _logger.LogInformation($"Auto-checked out previous attendance for employee: {employee.EmployeeId} - {employee.EmployeeName}");
                }

                // Create new check-in (first check-in of the day)
                var attendance = new EmployeeAttendance
                {
                    EmployeeId = employee.Id,
                    CheckInTime = DateTime.Now,
                    Notes = createDto.Notes,
                    CreatedAt = DateTime.Now
                };

                _context.EmployeeAttendances.Add(attendance);
                await _context.SaveChangesAsync();

                await _context.Entry(attendance).Reference(a => a.Employee).LoadAsync();
                await _context.Entry(attendance.Employee).Reference(e => e.Department).LoadAsync();

                _logger.LogInformation($"Employee checked in: {employee.EmployeeId} - {employee.EmployeeName}");

                var attendanceDto = _mapper.Map<EmployeeAttendanceDto>(attendance);

                // Send SignalR notification for employee attendance update
                await _hubContext.Clients.Group("EmployeeManagement").SendAsync("EmployeeAttendanceUpdated", new
                {
                    Attendance = attendanceDto,
                    EmployeeName = employee.EmployeeName,
                    EmployeeId = employee.EmployeeId,
                    Action = "CheckedIn",
                    Timestamp = DateTime.Now
                });

                return CreatedAtAction(nameof(GetAttendance), new { id = attendance.Id }, attendanceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording employee check-in");
                return StatusCode(500, new ApiResponse(500, "Error recording check-in"));
            }
        }

        /// <summary>
        /// Record employee check-out
        /// </summary>
        [HttpPost("attendance/{attendanceId}/checkout")]
        public async Task<ActionResult<EmployeeAttendanceDto>> CheckOut(int attendanceId)
        {
            try
            {
                var attendance = await _context.EmployeeAttendances
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .FirstOrDefaultAsync(a => a.Id == attendanceId);

                if (attendance == null)
                {
                    return NotFound(new ApiResponse(404, "Attendance record not found"));
                }

                if (attendance.CheckOutTime.HasValue)
                {
                    return BadRequest(new ApiResponse(400, "Employee is already checked out"));
                }

                attendance.CheckOutTime = DateTime.Now;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Employee checked out: {attendance.Employee.EmployeeId} - {attendance.Employee.EmployeeName}");

                var attendanceDto = _mapper.Map<EmployeeAttendanceDto>(attendance);

                // Send SignalR notification for employee attendance update
                await _hubContext.Clients.Group("EmployeeManagement").SendAsync("EmployeeAttendanceUpdated", new
                {
                    Attendance = attendanceDto,
                    EmployeeName = attendance.Employee.EmployeeName,
                    EmployeeId = attendance.Employee.EmployeeId,
                    Action = "CheckedOut",
                    Timestamp = DateTime.Now
                });

                return Ok(attendanceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error recording employee check-out: {attendanceId}");
                return StatusCode(500, new ApiResponse(500, "Error recording check-out"));
            }
        }

        /// <summary>
        /// Get attendance record by ID
        /// </summary>
        [HttpGet("attendance/{id}")]
        public async Task<ActionResult<EmployeeAttendanceDto>> GetAttendance(int id)
        {
            try
            {
                var attendance = await _context.EmployeeAttendances
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (attendance == null)
                {
                    return NotFound(new ApiResponse(404, "Attendance record not found"));
                }

                var attendanceDto = _mapper.Map<EmployeeAttendanceDto>(attendance);
                return Ok(attendanceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting attendance: {id}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving attendance"));
            }
        }

        /// <summary>
        /// Get employee attendance records
        /// </summary>
        [HttpGet("{employeeId}/attendance")]
        public async Task<ActionResult<IEnumerable<EmployeeAttendanceDto>>> GetEmployeeAttendance(
            int employeeId,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            try
            {
                var query = _context.EmployeeAttendances
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .Where(a => a.EmployeeId == employeeId)
                    .AsQueryable();

                if (dateFrom.HasValue)
                {
                    query = query.Where(a => a.CheckInTime >= dateFrom.Value);
                }

                if (dateTo.HasValue)
                {
                    var dateToEnd = dateTo.Value.Date.AddDays(1);
                    query = query.Where(a => a.CheckInTime < dateToEnd);
                }

                var attendances = await query
                    .OrderByDescending(a => a.CheckInTime)
                    .ToListAsync();

                var attendanceDtos = _mapper.Map<List<EmployeeAttendanceDto>>(attendances);
                return Ok(attendanceDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting employee attendance: {employeeId}");
                return StatusCode(500, new ApiResponse(500, "Error retrieving attendance"));
            }
        }

        /// <summary>
        /// Get today's attendance records (grouped by employee - first check-in, last check-out)
        /// </summary>
        [HttpGet("attendance/today")]
        public async Task<ActionResult<IEnumerable<EmployeeAttendanceGroupedDto>>> GetTodayAttendance()
        {
            try
            {
                var todayStart = DateTime.Now.Date;
                var todayEnd = todayStart.AddDays(1);

                // Get all attendance records for today
                var attendances = await _context.EmployeeAttendances
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .Where(a => a.CheckInTime >= todayStart && a.CheckInTime < todayEnd)
                    .OrderBy(a => a.EmployeeId)
                    .ThenBy(a => a.CheckInTime)
                    .ToListAsync();

                // Group by employee - get first check-in and last check-out
                var grouped = attendances
                    .GroupBy(a => a.EmployeeId)
                    .Select(g => new EmployeeAttendanceGroupedDto
                    {
                        EmployeeId = g.Key,
                        EmployeeName = g.First().Employee.EmployeeName,
                        EmployeeEmployeeId = g.First().Employee.EmployeeId,
                        DepartmentName = g.First().Employee.Department?.Name,
                        FirstCheckInTime = g.OrderBy(a => a.CheckInTime).First().CheckInTime,
                        LastCheckOutTime = g.Where(a => a.CheckOutTime.HasValue)
                            .OrderByDescending(a => a.CheckOutTime)
                            .FirstOrDefault()?.CheckOutTime,
                        IsCheckedIn = g.Any(a => !a.CheckOutTime.HasValue),
                        AttendanceId = g.OrderByDescending(a => a.CheckInTime).First().Id
                    })
                    .OrderByDescending(a => a.FirstCheckInTime)
                    .ToList();

                return Ok(grouped);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting today's attendance");
                return StatusCode(500, new ApiResponse(500, "Error retrieving today's attendance"));
            }
        }

        /// <summary>
        /// Cleanup old attendance records (older than specified days, default 90 days)
        /// </summary>
        [HttpDelete("attendance/cleanup")]
        public async Task<ActionResult> CleanupOldAttendance([FromQuery] int daysOld = 90)
        {
            try
            {
                var cutoffDate = DateTime.Now.Date.AddDays(-daysOld);
                
                // Get old attendance records that are checked out
                var oldAttendances = await _context.EmployeeAttendances
                    .Where(a => a.CheckOutTime.HasValue 
                        && a.CheckOutTime.Value < cutoffDate)
                    .ToListAsync();

                var count = oldAttendances.Count;
                
                if (count > 0)
                {
                    _context.EmployeeAttendances.RemoveRange(oldAttendances);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Cleaned up {count} old attendance records (older than {daysOld} days)");
                }

                return Ok(new { 
                    message = $"Cleaned up {count} old attendance records",
                    deletedCount = count,
                    cutoffDate = cutoffDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old attendance records");
                return StatusCode(500, new ApiResponse(500, "Error cleaning up attendance records"));
            }
        }

        /// <summary>
        /// Import employees from Excel or CSV file
        /// </summary>
        [HttpPost("import/excel")]
        public async Task<ActionResult> ImportFromExcel(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new ApiResponse(400, "File is required"));
                }

                var employees = new List<Employee>();
                var errors = new List<string>();

                var fileName = file.FileName.ToLower();
                var isCsv = fileName.EndsWith(".csv");
                bool processedSuccessfully = false;
                string processedFormat = "Excel";

                // Copy file to byte array for reuse (can create multiple streams from it)
                byte[] fileBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }

                // Try Excel first if not explicitly CSV
                if (!isCsv)
                {
                    try
                    {
                        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                        using (var stream = new MemoryStream(fileBytes))
                        using (var package = new ExcelPackage(stream))
                        {
                                if (package.Workbook.Worksheets.Count == 0)
                                {
                                    throw new InvalidDataException("Excel file contains no worksheets");
                                }

                                var worksheet = package.Workbook.Worksheets[0];

                                if (worksheet.Dimension == null)
                                {
                                    throw new InvalidDataException("Excel worksheet is empty");
                                }

                                // Start from row 2 (assuming row 1 is header)
                                var endRow = worksheet.Dimension.End.Row;
                                for (int row = 2; row <= endRow; row++)
                                {
                                    try
                                    {
                                        var employeeId = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                                        var employeeName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                                        var departmentIdStr = worksheet.Cells[row, 3].Value?.ToString()?.Trim();

                                        if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(employeeName))
                                        {
                                            errors.Add($"Row {row}: EmployeeId and EmployeeName are required");
                                            continue;
                                        }

                                        // Check if employee already exists
                                        var exists = await _context.Employees
                                            .AnyAsync(e => e.EmployeeId == employeeId);

                                        if (exists)
                                        {
                                            errors.Add($"Row {row}: Employee with ID {employeeId} already exists");
                                            continue;
                                        }

                                        int? departmentId = null;
                                        if (!string.IsNullOrWhiteSpace(departmentIdStr) && int.TryParse(departmentIdStr, out int deptId))
                                        {
                                            departmentId = deptId;
                                        }

                                        var employee = new Employee
                                        {
                                            EmployeeId = employeeId,
                                            EmployeeName = employeeName,
                                            DepartmentId = departmentId,
                                            CreatedAt = DateTime.Now,
                                            UpdatedAt = DateTime.Now,
                                            IsActive = true
                                        };

                                        employees.Add(employee);
                                    }
                                    catch (Exception ex)
                                    {
                                        errors.Add($"Row {row}: {ex.Message}");
                                    }
                                }
                        }
                        processedSuccessfully = true;
                        processedFormat = "Excel";
                    }
                    catch (Exception ex)
                    {
                        // If Excel parsing fails, try CSV as fallback
                        _logger.LogWarning($"Excel parsing failed: {ex.Message}. Trying CSV format.");
                        errors.Clear();
                        employees.Clear();
                    }
                }

                // Handle CSV file (either explicitly CSV or Excel parsing failed)
                if (isCsv || !processedSuccessfully)
                {
                    try
                    {
                        using (var stream = new MemoryStream(fileBytes))
                        using (var reader = new StreamReader(stream))
                        {
                            string? line;
                            int row = 1; // Start with header row

                            // Skip header row
                            var headerLine = await reader.ReadLineAsync();
                            if (headerLine == null)
                            {
                                throw new InvalidDataException("CSV file is empty");
                            }

                            while ((line = await reader.ReadLineAsync()) != null)
                            {
                                row++;
                                try
                                {
                                // Parse CSV line (handle quoted values)
                                var values = ParseCsvLine(line);
                                
                                if (values.Count < 2)
                                {
                                    errors.Add($"Row {row}: Insufficient columns. Expected at least 2 (EmployeeId, EmployeeName)");
                                    continue;
                                }

                                var employeeId = values[0]?.Trim();
                                var employeeName = values[1]?.Trim();
                                var departmentIdStr = values.Count > 2 ? values[2]?.Trim() : null;

                                if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(employeeName))
                                {
                                    errors.Add($"Row {row}: EmployeeId and EmployeeName are required");
                                    continue;
                                }

                                // Check if employee already exists
                                var exists = await _context.Employees
                                    .AnyAsync(e => e.EmployeeId == employeeId);

                                if (exists)
                                {
                                    errors.Add($"Row {row}: Employee with ID {employeeId} already exists");
                                    continue;
                                }

                                int? departmentId = null;
                                if (!string.IsNullOrWhiteSpace(departmentIdStr) && int.TryParse(departmentIdStr, out int deptId))
                                {
                                    departmentId = deptId;
                                }

                                var employee = new Employee
                                {
                                    EmployeeId = employeeId,
                                    EmployeeName = employeeName,
                                    DepartmentId = departmentId,
                                    CreatedAt = DateTime.Now,
                                    UpdatedAt = DateTime.Now,
                                    IsActive = true
                                };

                                employees.Add(employee);
                            }
                                catch (Exception ex)
                                {
                                    errors.Add($"Row {row}: {ex.Message}");
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        if (processedSuccessfully)
                        {
                            // If we already processed as Excel successfully, re-throw
                            throw;
                        }
                        // If CSV parsing also fails, log and return error
                        _logger.LogError(ex, $"CSV parsing failed: {ex.Message}");
                        return BadRequest(new ApiResponse(400, $"Unable to parse file as CSV: {ex.Message}"));
                    }
                    processedSuccessfully = true;
                    processedFormat = "CSV";
                }

                if (!processedSuccessfully)
                {
                    return BadRequest(new ApiResponse(400, "Unable to parse file. Please ensure it is a valid Excel (.xlsx) or CSV (.csv) file."));
                }

                if (employees.Count > 0)
                {
                    _context.Employees.AddRange(employees);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Imported {employees.Count} employees from {processedFormat}");
                }

                return Ok(new
                {
                    success = true,
                    importedCount = employees.Count,
                    errorCount = errors.Count,
                    errors = errors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error importing employees: {ex.Message}");
                return StatusCode(500, new ApiResponse(500, $"Error importing employees: {ex.Message}"));
            }
        }

        /// <summary>
        /// Parse CSV line handling quoted values
        /// </summary>
        private List<string> ParseCsvLine(string line)
        {
            var values = new List<string>();
            var currentValue = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                    {
                        // Escaped quote
                        currentValue.Append('"');
                        i++; // Skip next quote
                    }
                    else
                    {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == ',' && !inQuotes)
                {
                    // End of value
                    values.Add(currentValue.ToString());
                    currentValue.Clear();
                }
                else
                {
                    currentValue.Append(c);
                }
            }

            // Add last value
            values.Add(currentValue.ToString());

            return values;
        }
    }
}

