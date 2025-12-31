using System;

namespace Core.Entities.VisitorManagement
{
    /// <summary>
    /// Represents a department that visitors can visit
    /// This is separate from the DocumentManagement departments
    /// </summary>
    public class VisitorDepartment
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

