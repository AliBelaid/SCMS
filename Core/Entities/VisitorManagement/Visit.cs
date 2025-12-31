using System;
using Core.Entities.Identity;

namespace Core.Entities.VisitorManagement
{
    public class Visit
    {
        public int Id { get; set; }
        public string VisitNumber { get; set; }
        
        // Visitor Information
        public int VisitorId { get; set; }
        public Visitor Visitor { get; set; }
        public string VisitorName { get; set; }
        
        // Car Information
        public string? CarPlate { get; set; }
        public string? CarImageUrl { get; set; }
        
        // Department and Employee Information
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string EmployeeToVisit { get; set; }
        
        // Visit Details
        public string? VisitReason { get; set; }
        public int? ExpectedDurationHours { get; set; }
        
        // Status: 'checkedin', 'checkedout', 'rejected'
        public string Status { get; set; } = "checkedin";
        
        // Timestamps
        public DateTime CheckInAt { get; set; } = DateTime.UtcNow;
        public DateTime? CheckOutAt { get; set; }
        
        // Created By
        public int CreatedByUserId { get; set; }
        public AppUser CreatedByUser { get; set; }
        public string CreatedByUserName { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Rejection details (if status is 'rejected')
        public string? RejectionReason { get; set; }
        public DateTime? RejectedAt { get; set; }
        public int? RejectedByUserId { get; set; }
    }
}

