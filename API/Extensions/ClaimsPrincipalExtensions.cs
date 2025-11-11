using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {

        public static string? RetrieveEmailFormPrincipal(this ClaimsPrincipal user) {
            return user?.Claims.FirstOrDefault(i => i.Type == ClaimTypes.Email)?.Value;
        }
        
        public static string? RetrieveUseeByIdPrincipal(this ClaimsPrincipal user) {
            return user?.Claims.FirstOrDefault(i => i.Type == ClaimTypes.NameIdentifier)?.Value;
        }

       
       public static string? GetUserName(this ClaimsPrincipal user) {
             
     return     user?.Claims.FirstOrDefault(i =>i.Type==ClaimTypes.GivenName)?.Value;
    }

    public static int GetUserId(this ClaimsPrincipal user) {
        var userId = user?.Claims.FirstOrDefault(i => i.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userId != null && int.TryParse(userId, out int id)) {
            return id;
        }
        return 0;
    }
}
}