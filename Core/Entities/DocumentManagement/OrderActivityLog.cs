using System;
using Core.Entities.Identity;

namespace Core.Entities.DocumentManagement
{
    /// <summary>
    /// Represents an immutable audit trail entry for user activity on orders.
    /// </summary>
    public class OrderActivityLog
    {
        public long Id { get; set; }

        public int? OrderId { get; set; }
        public virtual Order Order { get; set; }

        public int UserId { get; set; }
        public virtual AppUser User { get; set; }

        public string UserName { get; set; }
        public string? UserCode { get; set; }

        public string ControllerName { get; set; }
        public string ActionName { get; set; }
        public string HttpMethod { get; set; }
        public string Path { get; set; }
        public string? QueryString { get; set; }

        public bool IsSuccess { get; set; }
        public int? StatusCode { get; set; }

        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }

        public string? Summary { get; set; }
        public string? PayloadSnapshot { get; set; }

        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    }
}

