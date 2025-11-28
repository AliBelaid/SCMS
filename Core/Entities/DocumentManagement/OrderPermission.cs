using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class OrderPermission
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [Required]
        public int UserId { get; set; }
        public virtual AppUser User { get; set; }

        [Required]
        public PermissionType PermissionType { get; set; }

        public int GrantedById { get; set; }
        public virtual AppUser GrantedBy { get; set; }

        public DateTime GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }

        public bool IsActive { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        public OrderPermission()
        {
            GrantedAt = DateTime.UtcNow;
            IsActive = true;
        }
    }

    public enum PermissionType
    {
        View = 1,
        Edit = 2,
        Delete = 3,
        Share = 4,
        Download = 5,
        Print = 6,
        Comment = 7,
        Approve = 8
    }
}

