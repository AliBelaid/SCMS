using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace Core.Entities.Identity;

public class AppRole : IdentityRole<int>    
{
    public ICollection<AppUserRole> UserRoles { get; set; }
}
