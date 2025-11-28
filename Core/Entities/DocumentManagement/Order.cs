using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    /// <summary>
    /// Enhanced Order entity with advanced permissions and expiration management
    /// </summary>
    public class Order
    {
        public int Id { get; set; }

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
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; }

        [Required]
        public int SubjectId { get; set; }
        public virtual Subject Subject { get; set; }

        [Required]
        public OrderStatus Status { get; set; }

        [Required]
        public OrderPriority Priority { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public int CreatedById { get; set; }
        public virtual AppUser CreatedBy { get; set; }

        public int? UpdatedById { get; set; }
        public virtual AppUser UpdatedBy { get; set; }

        public int? AssignedToId { get; set; }
        public virtual AppUser AssignedTo { get; set; }

        // Attachments
        public virtual ICollection<OrderAttachment> Attachments { get; set; }

        // History and Audit Trail
        public virtual ICollection<OrderHistory> History { get; set; }

        // ==================== Enhanced Permission System ====================

        /// <summary>
        /// User-level permissions (specific users with specific permissions)
        /// </summary>
        public virtual ICollection<OrderPermission> Permissions { get; set; }

        /// <summary>
        /// Department-level access (entire departments can access)
        /// </summary>
        public virtual ICollection<OrderDepartmentAccess> DepartmentAccesses { get; set; }

        /// <summary>
        /// User exceptions (users who are explicitly excluded from access)
        /// Priority: Exceptions > Direct Permissions > Department Access
        /// </summary>
        public virtual ICollection<OrderUserException> UserExceptions { get; set; }

        // ==================== Expiration Management ====================

        /// <summary>
        /// When the order expires and should be archived
        /// </summary>
        public DateTime? ExpirationDate { get; set; }

        /// <summary>
        /// Computed property - is the order expired?
        /// </summary>
        public bool IsExpired => ExpirationDate.HasValue && ExpirationDate.Value < DateTime.UtcNow;

        // ==================== Archive Management ====================

        public bool IsArchived { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public int? ArchivedById { get; set; }
        public virtual AppUser ArchivedBy { get; set; }

        [MaxLength(500)]
        public string ArchiveReason { get; set; }

        // ==================== Other Properties ====================

        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        /// <summary>
        /// If true, all users can view (but permissions still apply for edit/delete)
        /// </summary>
        public bool IsPublic { get; set; }

        public Order()
        {
            Attachments = new HashSet<OrderAttachment>();
            History = new HashSet<OrderHistory>();
            Permissions = new HashSet<OrderPermission>();
            DepartmentAccesses = new HashSet<OrderDepartmentAccess>();
            UserExceptions = new HashSet<OrderUserException>();
            CreatedAt = DateTime.UtcNow;
            Status = OrderStatus.Pending;
            Priority = OrderPriority.Medium;
            IsPublic = false;
            IsArchived = false;
        }

        /// <summary>
        /// Check if a user is the owner of this order
        /// </summary>
        public bool IsOwner(int userId)
        {
            return CreatedById == userId;
        }

        /// <summary>
        /// Check if a user is explicitly excluded from accessing this order
        /// </summary>
        public bool IsUserExcluded(int userId)
        {
            return UserExceptions.Any(ue =>
                ue.UserId == userId &&
                ue.IsActive &&
                (!ue.ExpiresAt.HasValue || ue.ExpiresAt.Value > DateTime.UtcNow)
            );
        }
    }
}
