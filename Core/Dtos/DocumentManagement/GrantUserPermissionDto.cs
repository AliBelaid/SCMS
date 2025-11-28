using System;

namespace Core.Dtos.DocumentManagement
{
    public class GrantUserPermissionDto
    {
        public int UserId { get; set; }
        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
        public bool CanDownload { get; set; }
        public bool CanPrint { get; set; }
        public bool CanComment { get; set; }
        public bool CanApprove { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Notes { get; set; }
    }
}

