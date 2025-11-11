using System;
using System.Collections.Generic;

namespace Core.Dtos.DocumentViewer
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastActive { get; set; }
        public string Token { get; set; }
        public string Country { get; set; }
        public string PreferredLanguage { get; set; } = "ar"; // Default to Arabic
     }

    public class CreateUserDto
    {
        public string Code { get; set; }
        public string Password { get; set; }
        // Removed from UI creation but still part of DTO for compatibility
        public string Description { get; set; }
        public string Role { get; set; } = "Member";
        public bool IsActive { get; set; } = true;
        public string Email { get; set; }
        public string Country { get; set; }
        public string PreferredLanguage { get; set; } = "ar"; // Default to Arabic
     }

    public class UpdateUserDto
    {
        public string Description { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public string Email { get; set; }
        public string Code { get; set; }
        public string Country { get; set; }
        public string PreferredLanguage { get; set; } = "ar"; // Default to Arabic
    }

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; }
        public string UserId { get; set; }
     
    }
} 