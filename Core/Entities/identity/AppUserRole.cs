using Microsoft.AspNetCore.Identity;
using Core.Entities.Identity;

namespace Core.Entities.Identity
{
    public class AppUserRole : IdentityUserRole<int>
    {
        public virtual AppUser User { get; set; }
        public virtual AppRole Role { get; set; }
    }
}
