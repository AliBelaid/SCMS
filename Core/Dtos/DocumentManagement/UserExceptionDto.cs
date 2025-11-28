using System;

namespace Core.Dtos.DocumentManagement
{
    public class UserExceptionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserCode { get; set; }
        public string UserEmail { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Reason { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired { get; set; }
        public bool IsActive { get; set; }
        public string AddedByName { get; set; }
    }
}

