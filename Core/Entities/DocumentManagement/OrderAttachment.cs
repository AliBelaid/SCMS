using System;
using System.ComponentModel.DataAnnotations;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    public class OrderAttachment
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; }

        [Required]
        [MaxLength(50)]
        public string FileType { get; set; }

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; }

        public long FileSize { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public int UploadedById { get; set; }
        public virtual AppUser UploadedBy { get; set; }

        public DateTime UploadedAt { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        public OrderAttachment()
        {
            UploadedAt = DateTime.UtcNow;
            IsDeleted = false;
        }
    }
}
