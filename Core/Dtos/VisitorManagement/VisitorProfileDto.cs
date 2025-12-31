using System;
using System.Collections.Generic;

namespace Core.Dtos.VisitorManagement
{
    /// <summary>
    /// Comprehensive visitor profile with statistics and visit history
    /// </summary>
    public class VisitorProfileDto
    {
        public VisitorDto Visitor { get; set; }
        
        // Statistics
        public int TotalVisits { get; set; }
        public int CompletedVisits { get; set; }
        public int OngoingVisits { get; set; }
        public DateTime? FirstVisitDate { get; set; }
        public DateTime? LastVisitDate { get; set; }
        public double? AverageVisitDurationMinutes { get; set; }
        
        // Profile image (from first visit)
        public string? ProfileImageUrl { get; set; }
        
        // Image gallery
        public List<VisitorImageDto> ImageGallery { get; set; } = new();
        
        // Visit history
        public List<VisitHistoryItemDto> VisitHistory { get; set; } = new();
        
        // Department statistics
        public List<DepartmentVisitStatsDto> DepartmentStats { get; set; } = new();
    }
    
    /// <summary>
    /// Image item for gallery (person, ID card, or car images)
    /// </summary>
    public class VisitorImageDto
    {
        public string ImageUrl { get; set; }
        public ImageType ImageType { get; set; }
        public string VisitNumber { get; set; }
        public DateTime VisitDate { get; set; }
        public string VisitInfo { get; set; } // e.g., "Visit to HR Department"
        public string? CarPlate { get; set; }
    }
    
    public enum ImageType
    {
        Person = 1,
        IdCard = 2,
        Car = 3
    }
    
    /// <summary>
    /// Visit history item for visitor profile
    /// </summary>
    public class VisitHistoryItemDto
    {
        public int Id { get; set; }
        public string VisitNumber { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string EmployeeToVisit { get; set; }
        public string? VisitReason { get; set; }
        public string Status { get; set; }
        public DateTime CheckInAt { get; set; }
        public DateTime? CheckOutAt { get; set; }
        public int? DurationMinutes { get; set; }
        public string? CarPlate { get; set; }
        public string? CarImageUrl { get; set; }
    }
    
    /// <summary>
    /// Department visit statistics for a visitor
    /// </summary>
    public class DepartmentVisitStatsDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int VisitCount { get; set; }
        public double Percentage { get; set; }
    }
    
    /// <summary>
    /// Visitor list item with summary statistics
    /// </summary>
    public class VisitorListItemDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string? NationalId { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsBlocked { get; set; }
        public int TotalVisits { get; set; }
        public DateTime? LastVisitDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

