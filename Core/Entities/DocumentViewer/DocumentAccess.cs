using System;
using Core.Entities.Identity;

namespace Core.Entities.DocumentViewer
{
    public class DocumentAccess : BaseEntity
    {
        public int DocumentId { get; set; }
        public int UserId { get; set; }
        public DateTime GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string GrantedBy { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public Document Document { get; set; }
        public AppUser User { get; set; }
    }
} 