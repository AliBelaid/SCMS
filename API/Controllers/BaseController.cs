using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using API.Extensions;
using System.Security.Claims;

namespace API.Controllers
{  
    // [ServiceFilter(typeof(LogUserActivity))]
    // Removing the [Authorize] attribute so login endpoints can work without authorization
    [ApiController]
    [Route("api/[controller]")]
    public class BaseController : ControllerBase
    {
        protected int GetUserId()
        {
            return User.GetUserId();
        }
    }
}