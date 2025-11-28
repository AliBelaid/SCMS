using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class OrderUserException
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [Required]
        public int UserId { get; set; }
        public virtual AppUser User { get; set; }

        [Required]
        public int CreatedById { get; set; }
        public virtual AppUser CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string Reason { get; set; }
    }
}

