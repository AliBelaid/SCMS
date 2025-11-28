namespace Core.Dtos.DocumentManagement
{
    public class UserPermissionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserCode { get; set; }
        public string UserEmail { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
        public bool CanDownload { get; set; }
        public bool CanPrint { get; set; }
        public bool CanComment { get; set; }
        public bool CanApprove { get; set; }
        public System.DateTime GrantedAt { get; set; }
        public System.DateTime? ExpiresAt { get; set; }
        public bool IsExpired { get; set; }
        public bool IsActive { get; set; }
        public string Notes { get; set; }
        public string GrantedByName { get; set; }
    }
}

