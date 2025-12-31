using System;

namespace Core.Dtos.DocumentManagement
{
    public class GrantDepartmentAccessDto
    {
        public string DepartmentId { get; set; } // Can be string or int
        public int AccessLevel { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Notes { get; set; }
    }
}

