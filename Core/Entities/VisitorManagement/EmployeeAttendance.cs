using System;

namespace Core.Entities.VisitorManagement
{
    public class EmployeeAttendance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; }
        public DateTime CheckInTime { get; set; } = DateTime.Now;
        public DateTime? CheckOutTime { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}

