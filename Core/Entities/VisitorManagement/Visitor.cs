using System;

namespace Core.Entities.VisitorManagement
{
    public class Visitor
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? MedicalNotes { get; set; }
        public string? PersonImageUrl { get; set; }
        public string? IdCardImageUrl { get; set; }
        
        // Visitor Status: Active or Blocked
        public bool IsBlocked { get; set; } = false;
        public string? BlockReason { get; set; }
        public DateTime? BlockedAt { get; set; }
        public int? BlockedByUserId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedByUserId { get; set; }
    }
}

