using System;

namespace Core.Dtos.DocumentManagement
{
    public class GrantDepartmentAccessDto
    {
        public int DepartmentId { get; set; }
        public int AccessLevel { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Notes { get; set; }
    }
}

