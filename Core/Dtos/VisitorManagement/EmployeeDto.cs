namespace Core.Dtos.VisitorManagement
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string? CardImageUrl { get; set; }
        public string? FaceImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateEmployeeDto
    {
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int? DepartmentId { get; set; }
        public string? CardImageBase64 { get; set; }
        public string? FaceImageBase64 { get; set; }
    }

    public class UpdateEmployeeDto
    {
        public string? EmployeeName { get; set; }
        public int? DepartmentId { get; set; }
        public string? CardImageBase64 { get; set; }
        public string? FaceImageBase64 { get; set; }
        public bool? IsActive { get; set; }
    }

    public class EmployeeAttendanceDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string? EmployeeEmployeeId { get; set; }
        public DateTime CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public string? Notes { get; set; }
        public string? DepartmentName { get; set; }
    }

    public class CreateEmployeeAttendanceDto
    {
        public string EmployeeIdOrName { get; set; } // Can be EmployeeId or EmployeeName
        public string? Notes { get; set; }
    }

    public class EmployeeAttendanceReportDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string? EmployeeEmployeeId { get; set; }
        public string? DepartmentName { get; set; }
        public int TotalCheckIns { get; set; }
        public DateTime? LastCheckIn { get; set; }
        public DateTime? LastCheckOut { get; set; }
        public List<EmployeeAttendanceDto> RecentAttendances { get; set; } = new();
    }

    /// <summary>
    /// Lightweight DTO for grouped attendance (first check-in, last check-out per day)
    /// </summary>
    public class EmployeeAttendanceGroupedDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string? EmployeeEmployeeId { get; set; }
        public string? DepartmentName { get; set; }
        public DateTime FirstCheckInTime { get; set; }
        public DateTime? LastCheckOutTime { get; set; }
        public bool IsCheckedIn { get; set; }
        public int AttendanceId { get; set; } // ID of the current/active attendance record
    }
}

