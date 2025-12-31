using System;

namespace Core.Dtos.DocumentManagement
{
    public class OrderAttachmentDto
    {
        public string Id { get; set; }
        public int? DocumentId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public int UploadedById { get; set; }
        public string FileUrl { get; set; }
        public bool CanView { get; set; }
        public bool CanDownload { get; set; }
    }
}

