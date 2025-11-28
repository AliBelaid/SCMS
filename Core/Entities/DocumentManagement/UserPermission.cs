using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    /// <summary>
    /// User-level permissions for an order
    /// Grants specific permissions to individual users
    /// </summary>
    public class UserPermission
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [Required]
        public int UserId { get; set; }
        public virtual AppUser User { get; set; }

        // Granular permissions
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
        public bool CanDownload { get; set; }
        public bool CanPrint { get; set; }
        public bool CanComment { get; set; }
        public bool CanApprove { get; set; }

        public int GrantedById { get; set; }
        public virtual AppUser GrantedBy { get; set; }

        public DateTime GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;

        [MaxLength(500)]
        public string Notes { get; set; }

        public UserPermission()
        {
            GrantedAt = DateTime.UtcNow;
            CanView = true; // Default: at least view permission
        }
    }
}

