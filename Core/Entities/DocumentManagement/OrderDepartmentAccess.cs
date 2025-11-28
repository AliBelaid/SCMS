using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class OrderDepartmentAccess
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [Required]
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; }

        [Required]
        public int GrantedById { get; set; }
        public virtual AppUser GrantedBy { get; set; }

        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; }
        public bool CanDownload { get; set; }
        public bool CanShare { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }
    }
}

