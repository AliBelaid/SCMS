using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities.Inventory
{
    public class InventoryTransaction : BaseEntity
    {
        [Required]
        public int InventoryItemId { get; set; }

        [ForeignKey("InventoryItemId")]
        public virtual InventoryItem InventoryItem { get; set; }

        [Required]
        [MaxLength(50)]
        public string TransactionType { get; set; } // purchase, consumption, adjustment-increase, adjustment-decrease, return, transfer

        [Required]
        public int Quantity { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string ReferenceNumber { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        [Required]
        [MaxLength(100)]
        public string PerformedBy { get; set; }

        [MaxLength(100)]
        public string SourceLocation { get; set; }

        [MaxLength(100)]
        public string DestinationLocation { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? UnitCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalCost { get; set; }

        [MaxLength(50)]
        public string BatchNumber { get; set; }
    }
} 