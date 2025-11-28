using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class Department
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

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public int? ManagerId { get; set; }
        public virtual AppUser Manager { get; set; }

        public int? ParentDepartmentId { get; set; }
        public virtual Department ParentDepartment { get; set; }

        public virtual ICollection<Department> SubDepartments { get; set; }
        public virtual ICollection<Subject> Subjects { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
        public virtual ICollection<DepartmentUser> DepartmentUsers { get; set; }
        public virtual ICollection<OrderDepartmentAccess> OrderAccesses { get; set; }

        public Department()
        {
            SubDepartments = new HashSet<Department>();
            Subjects = new HashSet<Subject>();
            Orders = new HashSet<Order>();
            DepartmentUsers = new HashSet<DepartmentUser>();
            OrderAccesses = new HashSet<OrderDepartmentAccess>();
            CreatedAt = DateTime.UtcNow;
            IsActive = true;
        }
    }
}
