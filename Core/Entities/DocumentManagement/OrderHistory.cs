using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    /// <summary>
    /// Tracks all changes made to an order for audit purposes
    /// </summary>
    public class OrderHistory
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [Required]
        public OrderAction Action { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; }

        [MaxLength(2000)]
        public string OldValue { get; set; }

        [MaxLength(2000)]
        public string NewValue { get; set; }

        public int PerformedById { get; set; }
        public virtual AppUser PerformedBy { get; set; }

        public DateTime PerformedAt { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        [MaxLength(50)]
        public string IpAddress { get; set; }

        [MaxLength(200)]
        public string UserAgent { get; set; }

        public OrderHistory()
        {
            PerformedAt = DateTime.UtcNow;
        }
    }

}

