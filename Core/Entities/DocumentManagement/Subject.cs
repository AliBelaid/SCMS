using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Core.Entities.DocumentManagement
{
    public class Subject
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string Code { get; set; }

        [Required]
        [MaxLength(100)]
        public string NameAr { get; set; }

        [Required]
        [MaxLength(100)]
        public string NameEn { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<Order> Orders { get; set; }

        public Subject()
        {
            Orders = new HashSet<Order>();
            CreatedAt = DateTime.UtcNow;
            IsActive = true;
        }
    }
}