using System;

namespace Core.Entities.DocumentManagement
{
    public class OrderAttachment : BaseEntity
    {
        public int OrderId { get; set; }
        public Order Order { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public string FileType { get; set; }
        public string FileUrl { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public string UploadedBy { get; set; }
    }
}

