using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Entities.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class UserManagerExtensions
    {
        public static async Task<AppUser?> FindByUserClaimsAsync(this UserManager<AppUser> input, ClaimsPrincipal user)
        {
            if (user == null)
                return null;
                
            var email = user.FindFirstValue(ClaimTypes.Email);
            
            if (string.IsNullOrEmpty(email))
                return null;
                
            try
            {
                return await input.Users.Include(p => p.UserRoles).ThenInclude(i => i.Role).FirstOrDefaultAsync(x => x.Email == email);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in FindByUserClaimsAsync: {ex.Message}");
                return await input.Users
                    .FirstOrDefaultAsync(x => x.Email == email);
            }
        }

        public static async Task<AppUser?> FindByUserName(this UserManager<AppUser> input, ClaimsPrincipal user)
        {   
            if (user == null)
                return null;
                
            var userName = user.FindFirstValue(ClaimTypes.GivenName);
            
            if (string.IsNullOrEmpty(userName))
                return null;
                
            return await input.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .FirstOrDefaultAsync(i => i.UserName == userName);
        }

        public static async Task<AppUser?> FindByEmailFromClaimsPrincipal(this UserManager<AppUser> userManager, ClaimsPrincipal user)
        {
            var email = user.FindFirstValue(ClaimTypes.Email);
            return await userManager.Users
                .SingleOrDefaultAsync(x => x.Email == email);
        }

     
    }
} 