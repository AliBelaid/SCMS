using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities.Identity;

namespace API.Dtos
{
    public class Member
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public UserType UserType { get; set; }
        public DateTime LastActive { get; set; }
        public List<string> Roles { get; set; }
    }
}