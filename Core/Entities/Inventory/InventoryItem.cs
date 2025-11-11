using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities.Inventory
{
    public class InventoryItem : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string ItemCode { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; }

        [Required]
        public int CurrentStock { get; set; }

        [Required]
        public int MinimumStockLevel { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [MaxLength(20)]
        public string UnitOfMeasure { get; set; }

        [Required]
        [MaxLength(100)]
        public string Location { get; set; }

        [MaxLength(100)]
        public string Supplier { get; set; }

        [MaxLength(100)]
        public string ManufacturerName { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "in-stock";

        public virtual ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
    }
} 