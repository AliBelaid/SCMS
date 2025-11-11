using System;
using System.Collections.Generic;

namespace Core.Entities.DocumentManagement
{
    public class Order : BaseEntity
    {
        public string ReferenceNumber { get; set; }
        public OrderType Type { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
        public string DepartmentCode { get; set; }
        public int SubjectId { get; set; }
        public Subject Subject { get; set; }
        public string SubjectCode { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public OrderPriority Priority { get; set; } = OrderPriority.Medium;
        public ICollection<OrderAttachment> Attachments { get; set; } = new List<OrderAttachment>();
        public string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? DueDate { get; set; }
        public OrderPermissions Permissions { get; set; } = new();
    }
}

