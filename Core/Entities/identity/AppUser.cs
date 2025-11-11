using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Core.Entities.Identity
{
    public class AppUser : IdentityUser<int>
    {
        public string CodeUser { get; set; } 
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public virtual ICollection<AppUserRole> UserRoles { get; set; }
      
        public bool IsActive { get; set; } = true; 
        public string? Country { get; set; } 
        public string PreferredLanguage { get; set; } = "ar"; // Default to Arabic
    }
}