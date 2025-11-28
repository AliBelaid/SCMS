using System;

namespace Core.Dtos.DocumentManagement
{
    public class AddUserExceptionDto
    {
        public int UserId { get; set; }
        public string Reason { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}

