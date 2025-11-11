using System;
using System.Collections.Generic;

namespace Core.Dtos.DocumentViewer
{
    public class DocumentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public string UploadedBy { get; set; }
        public DateTime DateUploaded { get; set; }
        public bool IsActive { get; set; }
        public List<string> ExcludedUsers { get; set; } = new List<string>();
        public string Description { get; set; }
        public string Tags { get; set; }
        public string Category { get; set; }
        public string FileSizeFormatted { get; set; }
    }

    public class CreateDocumentDto
    {
        public string FileName { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public List<string> ExcludedUsers { get; set; } = new List<string>();
        public string Description { get; set; }
        public string Tags { get; set; }
        public string Category { get; set; }
    }

    public class UpdateDocumentDto
    {
        public string Description { get; set; }
        public string Tags { get; set; }
        public string Category { get; set; }
        public List<string> ExcludedUsers { get; set; } = new List<string>();
    }
} 