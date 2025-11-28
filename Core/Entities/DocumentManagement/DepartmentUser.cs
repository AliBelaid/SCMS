using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class DepartmentUser
    {
        public int Id { get; set; }

        [Required]
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; }

        [Required]
        public int UserId { get; set; }
        public virtual AppUser User { get; set; }

        [MaxLength(100)]
        public string Position { get; set; }

        public bool IsHead { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }

        public bool IsActive { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        public DepartmentUser()
        {
            JoinedAt = DateTime.UtcNow;
            IsActive = true;
            IsHead = false;
        }
    }
}

