using System;

namespace Core.Dtos.DocumentManagement
{
    public class DepartmentAccessDto
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentCode { get; set; }
        public string DepartmentNameAr { get; set; }
        public string DepartmentName { get; set; }
        public int AccessLevel { get; set; }
        public string AccessLevelName { get; set; }
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDownload { get; set; }
        public bool CanShare { get; set; }
        public string Notes { get; set; }
        public DateTime GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired { get; set; }
        public string GrantedByName { get; set; }
    }
}

