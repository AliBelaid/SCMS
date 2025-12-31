#nullable enable
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Dtos;
using API.Errors;
using API.Services;
using Core.Dtos.DocumentViewer;
using Core.Interfaces;
using Core.Entities.Identity;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : BaseController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppIdentityDbContext _context;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(
            UserManager<AppUser> userManager, 
            AppIdentityDbContext context,
            SignInManager<AppUser> signInManager,
            ITokenService tokenService,
            ILogger<AccountController> logger)
        {
            _userManager = userManager;
            _context = context;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<Core.Dtos.DocumentViewer.UserDto>> Login(LoginDto loginDto)
        {
            try
            {
                // Validate input
                if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Code))
                {
                    return BadRequest(new ApiResponse(400, "User code is required"));
                }

                if (string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    return BadRequest(new ApiResponse(400, "Password is required"));
                }

                _logger.LogInformation($"Login attempt for code: {loginDto.Code}");

                // Find user by CodeUser
                var user = await _context.Users
                    .Include(p => p.UserRoles)
                        .ThenInclude(t => t.Role)
                    .FirstOrDefaultAsync(x => x.CodeUser == loginDto.Code);

                if (user == null)
                {
                    _logger.LogWarning($"Login failed: User not found for code: {loginDto.Code}");
                    return Unauthorized(new ApiResponse(401, "Invalid user code or password"));
                }

                _logger.LogInformation($"User found: {user.Id} - {user.CodeUser} - IsActive: {user.IsActive}");

                // Check if user is active
                if (!user.IsActive)
                {
                    _logger.LogWarning($"Login failed: User {user.CodeUser} is not active");
                    return Unauthorized(new ApiResponse(401, "Account is disabled"));
                }

                // Check password
                _logger.LogInformation($"Checking password for user {user.CodeUser}");
                var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
                
                if (!result)
                {
                    _logger.LogWarning($"Login failed: Invalid password for user {user.CodeUser}");
                    return Unauthorized(new ApiResponse(401, "Invalid user code or password"));
                }

                // Get user roles
                var roleNames = user.UserRoles.Select(r => r.Role.Name).ToList();

                // Generate token
                var token = await _tokenService.CreateToken(user);

                // Update last active
                user.LastActive = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                // Return user data
                var userToReturn = new Core.Dtos.DocumentViewer.UserDto
                {
                    Id = user.Id,
                    Code = user.CodeUser,
                    Description = user.CodeUser,
                    Role = roleNames.FirstOrDefault() ?? "Member",
                    IsActive = user.IsActive,
                    LastActive = user.LastActive,
                    PreferredLanguage = user.PreferredLanguage ?? "ar",
                    Token = token
                };

                _logger.LogInformation($"Login successful for user {user.CodeUser}");
                return Ok(userToReturn);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new ApiResponse(500, "System error. Please try again"));
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<Core.Dtos.DocumentViewer.UserDto>> GetCurrentUser()
        {
            try
            {
                _logger.LogInformation("GetCurrentUser called");
                
                var nameIdentifier = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(nameIdentifier))
                {
                    _logger.LogWarning("GetCurrentUser: NameIdentifier claim not found");
                    return Unauthorized(new ApiResponse(401, "Not authenticated - NameIdentifier claim not found"));
                }

                _logger.LogInformation($"GetCurrentUser: Looking for user with NameIdentifier: {nameIdentifier}");
                
                var user = await _userManager.Users
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .SingleOrDefaultAsync(x => x.Id == int.Parse(nameIdentifier)    );
                    
                if (user == null)
                {
                    _logger.LogWarning($"GetCurrentUser: User not found for NameIdentifier: {nameIdentifier}");
                    return NotFound(new ApiResponse(404, "User not found"));
                }

                _logger.LogInformation($"GetCurrentUser: Found user {user.Id} - {user.CodeUser}");
                
                var roleNames = user.UserRoles.Select(r => r.Role.Name).ToList();

                var userToReturn = new Core.Dtos.DocumentViewer.UserDto
                {
                    Id = user.Id,
                    Code = user.CodeUser,
                    Description = user.CodeUser,
                    Role = roleNames.FirstOrDefault() ?? "Member",
                    IsActive = user.IsActive,
                    LastActive = user.LastActive,
                    PreferredLanguage = user.PreferredLanguage ?? "ar", // Default to Arabic
                    Token = await _tokenService.CreateToken(user)
                };

                _logger.LogInformation($"GetCurrentUser: Successfully returning user data for {user.Id}");
                return Ok(userToReturn);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetCurrentUser: Unexpected error");
                return StatusCode(500, new ApiResponse(500, "Internal server error while getting current user"));
            }
        }
    }
}