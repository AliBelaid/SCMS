using System;
using System.Collections.Generic;
using Core.Entities.Identity;

namespace Core.Entities.DocumentViewer
{
    public class Document : BaseEntity
    {
        public string FileName { get; set; }
        public string FileType { get; set; } // pdf, word, excel, image, audio, video
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public string UploadedBy { get; set; }
        public DateTime DateUploaded { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Permission settings - only excluded users
        public List<string> ExcludedUsers { get; set; } = new List<string>();
        
        // Navigation properties
        public int UploadedById { get; set; }
        public AppUser UploadedByUser { get; set; }
        
        // Document metadata
        public string Description { get; set; }
        public string Tags { get; set; }
        public string Category { get; set; }
    }
} 