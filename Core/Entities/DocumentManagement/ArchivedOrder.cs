using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class ArchivedOrder
    {
        public int Id { get; set; }

        [Required]
        public int OriginalOrderId { get; set; }
        public virtual Order OriginalOrder { get; set; }

        [Required]
        [MaxLength(50)]
        public string ReferenceNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [Required]
        public OrderType Type { get; set; }

        [Required]
        public OrderStatus Status { get; set; }

        [Required]
        public OrderPriority Priority { get; set; }

        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }

        public int SubjectId { get; set; }
        public string SubjectName { get; set; }

        public DateTime OriginalCreatedAt { get; set; }
        public DateTime? OriginalUpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime ExpirationDate { get; set; }

        [Required]
        public int ArchivedById { get; set; }
        public virtual AppUser ArchivedBy { get; set; }

        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string ArchiveReason { get; set; }

        public int OriginalCreatedById { get; set; }
        public string OriginalCreatedByName { get; set; }
        public string Notes { get; set; }

        public string SerializedOrderData { get; set; }
        public string AttachmentsInfo { get; set; }
        public bool CanBeRestored { get; set; } = true;
    }
}

