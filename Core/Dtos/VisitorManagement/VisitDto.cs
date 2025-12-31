using System;

namespace Core.Dtos.VisitorManagement
{
    public class VisitDto
    {
        public int Id { get; set; }
        public string VisitNumber { get; set; }
        public int VisitorId { get; set; }
        public string VisitorName { get; set; }
        public string? CarPlate { get; set; }
        public string? CarImageUrl { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string EmployeeToVisit { get; set; }
        public string? VisitReason { get; set; }
        public int? ExpectedDurationHours { get; set; }
        public string Status { get; set; }
        public DateTime CheckInAt { get; set; }
        public DateTime? CheckOutAt { get; set; }
        public int CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVisitDto
    {
        public VisitorDtoWithBase64 Visitor { get; set; }
        public string? CarPlate { get; set; }
        public string? CarImageBase64 { get; set; }
        public int DepartmentId { get; set; }
        public string EmployeeToVisit { get; set; }
        public string? VisitReason { get; set; }
        public int? ExpectedDurationHours { get; set; }
    }

    public class VisitSummaryDto
    {
        public int TotalVisits { get; set; }
        public int TotalCompleted { get; set; }
        public int TotalOngoing { get; set; }
        public DepartmentVisitCountDto[] VisitsPerDepartment { get; set; }
        public UserVisitCountDto[] VisitsPerUser { get; set; }
    }

    public class DepartmentVisitCountDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int VisitCount { get; set; }
        public double Percentage { get; set; }
    }

    public class UserVisitCountDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int VisitCount { get; set; }
        public int Rank { get; set; }
    }

    public class RejectVisitDto
    {
        public string RejectionReason { get; set; }
    }

    public class HourlyDistributionDto
    {
        public string Hour { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalVisits { get; set; }
        public int TotalCompleted { get; set; }
        public int TotalOngoing { get; set; }
        public int TodayVisits { get; set; }
        public int WeekVisits { get; set; }
        public int MonthVisits { get; set; }
        public List<DepartmentVisitCountDto> VisitsPerDepartment { get; set; } = new();
        public List<UserVisitCountDto> VisitsPerUser { get; set; } = new();
        public double AverageDurationMinutes { get; set; }
        public List<HourlyDistributionDto> HourlyDistribution { get; set; } = new();
    }

    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class CreateDepartmentDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class UpdateDepartmentDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool? IsActive { get; set; }
    }
}

