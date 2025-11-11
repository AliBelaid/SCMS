using System;
using System.Collections.Generic;
using Core.Entities.Identity;

namespace API.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? Token { get; set; }
        public string? PhoneNumber { get; set; }
        public string? UserType { get; set; }
        public List<string>? Roles { get; set; }
        public DateTime LastActive { get; set; }
        public List<object>? AccessibleFolders { get; set; }
        public List<object>? AccessibleFolderTypes { get; set; }
    }
}
