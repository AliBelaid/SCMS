namespace Core.Dtos.DocumentManagement
{
    public class EffectivePermissions
    {
        public int UserId { get; set; }
        public int OrderId { get; set; }
        public bool IsOwner { get; set; }
        public bool IsExcluded { get; set; }
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
        public bool CanDownload { get; set; }
        public bool CanApprove { get; set; }
        public bool CanComment { get; set; }
        public bool CanPrint { get; set; }
        public string PermissionSource { get; set; }
        public bool IsAdmin { get; set; }
        public List<string> GrantedPermissions { get; set; } = new List<string>();
    }
}

