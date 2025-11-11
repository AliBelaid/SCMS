using System;

namespace Core.Entities
{
    public class User : BaseEntity
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Code { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 