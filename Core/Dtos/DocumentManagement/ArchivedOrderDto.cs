using System;

namespace Core.Dtos.DocumentManagement
{
    public class ArchivedOrderDto
    {
        public int Id { get; set; }
        public string ReferenceNumber { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int OriginalOrderId { get; set; }
        public string DepartmentName { get; set; }
        public string SubjectName { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public DateTime ExpirationDate { get; set; }
        public DateTime ArchivedAt { get; set; }
        public string ArchiveReason { get; set; }
        public string ArchivedByName { get; set; }
        public bool CanBeRestored { get; set; }
    }
}

