using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using API.Helpers;
namespace API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
  var result= await next();  
           if(result.HttpContext.User.Identity.IsAuthenticated){
        var contextDb =   result.HttpContext.RequestServices.GetService<IUserRepository>();
        var userId = int.Parse(result.HttpContext.User.RetrieveUseeByIdPrincipal());
          var user = await contextDb.GetUserByIdAsync(userId) ;
          user.LastActive = DateTime.Now;
            contextDb.Update(user);
           await contextDb.SaveAllAsync();
           }
            
        }
    }
}