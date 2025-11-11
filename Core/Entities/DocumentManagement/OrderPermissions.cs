using System.Collections.Generic;

namespace Core.Entities.DocumentManagement
{
    public class OrderPermissions
    {
        public List<string> CanView { get; set; } = new();
        public List<string> CanEdit { get; set; } = new();
        public List<string> CanDelete { get; set; } = new();
        public List<string> ExcludedUsers { get; set; } = new();
        public bool IsPublic { get; set; }
    }
}

