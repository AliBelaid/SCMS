using System;

namespace Core.Entities.VisitorManagement
{
    public class Employee
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } // Barcode/ID for scanning
        public string EmployeeName { get; set; }
        public int? DepartmentId { get; set; }
        public VisitorDepartment? Department { get; set; }
        public string? CardImageUrl { get; set; }
        public string? FaceImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
    }
}

