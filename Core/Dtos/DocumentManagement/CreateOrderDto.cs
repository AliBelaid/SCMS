using System;
using System.Collections.Generic;

namespace Core.Dtos.DocumentManagement
{
    public class CreateOrderDto
    {
        public string ReferenceNumber { get; set; }
        public string Type { get; set; } // "incoming" or "outgoing"
        public string DepartmentId { get; set; }
        public string DepartmentCode { get; set; }
        public string SubjectId { get; set; }
        public string SubjectCode { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } // "pending", "in-progress", "completed"
        public string Priority { get; set; } // "low", "medium", "high", "urgent"
        public DateTime? DueDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string Notes { get; set; }
        public bool IsPublic { get; set; }

        // Permissions
        public List<GrantUserPermissionDto> UserPermissions { get; set; } = new List<GrantUserPermissionDto>();
        public List<GrantDepartmentAccessDto> DepartmentAccesses { get; set; } = new List<GrantDepartmentAccessDto>();
        public List<AddUserExceptionDto> UserExceptions { get; set; } = new List<AddUserExceptionDto>();

        // Attachments (file IDs from DocumentViewer or file uploads)
        public List<int> AttachmentIds { get; set; } = new List<int>();
    }
}

