using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Controllers;
using API.Dtos;
using API.Errors;
using API.Extensions;
using API.Helpers;
using API.Hubs;
using AutoMapper;
using Core.Dtos.DocumentViewer;
using Core.Entities;
using Core.Entities.Identity;
using Core.interfaces;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace API.Controllers;

// [ServiceFilter(typeof(LogUserActivity))]   
[Authorize(Policy = "RequireAdminRole")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : BaseController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IMapper _mapper;
    private readonly AppIdentityDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public AdminController(UserManager<AppUser> userManager, IMapper mapper, AppIdentityDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _userManager = userManager;
        _mapper = mapper;
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        try 
        {
            var users = await _userManager.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .OrderBy(u => u.UserName)
                .ToListAsync();
            
            var result = _mapper.Map<List<Core.Dtos.DocumentViewer.UserDto>>(users);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
        }
    }

 
   

    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("photos-to-moderate")]
    public ActionResult GetPhotosForModeration()
    {
        return Ok("Admins or moderators can see this");
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<bool>> ResetPassword([FromBody] ResetPasswordDto item)
    {
        var user = await _userManager.FindByIdAsync(item.UserId.ToString());
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var removeResult = await _userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
        {
            return BadRequest("Failed to remove current password.");
        }

        var addResult = await _userManager.AddPasswordAsync(user, item.NewPassword);
        return Ok(addResult.Succeeded);
    }

    [HttpPost("create")]
    public async Task<ActionResult<bool>> CreateUser([FromBody] CreateUserDto createUserDto)
    { 
        try
        {
            // Generate email from code if not provided
            string email = createUserDto.Email;
            if (string.IsNullOrEmpty(email))
            {
                email = $"{createUserDto.Code}@example.com";
            }
            
            // Log the creation attempt
            Console.WriteLine($"Creating user with code: {createUserDto.Code}, email: {email}, role: {createUserDto.Role}");
            
            // Check if email already exists
            if (await _userManager.FindByEmailAsync(email) != null)
            {
                return BadRequest(new { message = "Email already exists" });
            }
            
            // Check if user code already exists
            var existingUser = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == createUserDto.Code);
            if (existingUser != null)
            {
                return BadRequest(new { 
                    message = $"User code '{createUserDto.Code}' already exists. Please choose a different code.",
                    existingUserId = existingUser.Id,
                    existingUserCode = existingUser.CodeUser
                });
            }
            
            var user = new AppUser
            {
                UserName = createUserDto.Code,
                Email = email,
                CodeUser = createUserDto.Code,
                Country = createUserDto.Country,
                PreferredLanguage = createUserDto.PreferredLanguage ?? "ar", // Default to Arabic
                IsActive = createUserDto.IsActive,
                LastActive = DateTime.UtcNow
            };
            
            var result = await _userManager.CreateAsync(user, createUserDto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to create user", errors = result.Errors });
            }
            
            var rolesList = String.IsNullOrEmpty(createUserDto.Role) ? new string[] { "Member" } : new string[] { createUserDto.Role };
            var roleResult = await _userManager.AddToRolesAsync(user, rolesList);
            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);
                return BadRequest(new { message = "Failed to assign roles", errors = roleResult.Errors });
            }
            
            Console.WriteLine($"User created successfully: {user.Id} - {user.CodeUser} - {user.Email}");
            return Ok(true);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred creating the user", 
                error = ex.Message,
                details = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("emailexists")]
    public async Task<ActionResult<bool>> CheckEmailExistsAsync([FromQuery] string email)
    {
        return await _userManager.FindByEmailAsync(email) != null;
    }

    // Categories endpoints removed - using predefined folder categories instead

    [HttpDelete("delete-user/{userId}")]
    public async Task<ActionResult> DeleteUser(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return NotFound("User not found");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest("Failed to delete user");
        }

        return Ok(new { message = "User deleted successfully" });
    }

    [HttpPut("update-user/{userId}")]
    public async Task<ActionResult> UpdateUser(int userId, [FromBody] Core.Dtos.DocumentViewer.UpdateUserDto updateUserDto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Update user properties
        user.CodeUser = updateUserDto.Code;
        user.Email = updateUserDto.Email;
        user.IsActive = updateUserDto.IsActive;
        if (!string.IsNullOrWhiteSpace(updateUserDto.Country))
        {
            user.Country = updateUserDto.Country;
        }
        if (!string.IsNullOrWhiteSpace(updateUserDto.PreferredLanguage))
        {
            user.PreferredLanguage = updateUserDto.PreferredLanguage;
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest("Failed to update user");
        }

        // Update roles if needed
        if (!string.IsNullOrEmpty(updateUserDto.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, updateUserDto.Role);
        }

        return Ok(new { message = "User updated successfully" });
    }

    [HttpPost("activate-user/{userId}")]
    public async Task<ActionResult> ActivateUser(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return NotFound("User not found");
        }

        user.IsActive = true;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest("Failed to activate user");
        }

        return Ok(new { message = "User activated successfully" });
    }

    [HttpPost("deactivate-user/{userId}")]
    public async Task<ActionResult> DeactivateUser(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return NotFound("User not found");
        }

        user.IsActive = false;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest("Failed to deactivate user");
        }

        return Ok(new { message = "User deactivated successfully" });
    }

    [HttpGet("check-code/{code}")]
    public async Task<ActionResult<bool>> CheckUserCodeExists(string code)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
        return Ok(user != null);
    }

    [HttpGet("user-details/{code}")]
    public async Task<ActionResult> GetUserDetails(string code)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var roles = await _userManager.GetRolesAsync(user);
        
        return Ok(new
        {
            id = user.Id,
            codeUser = user.CodeUser,
            email = user.Email,
            userName = user.UserName,
            isActive = user.IsActive,
            preferredLanguage = user.PreferredLanguage ?? "ar",
            roles = roles,
            hasPassword = !string.IsNullOrEmpty(user.PasswordHash)
        });
    }

    [HttpPost("reset-user-password/{code}")]
    public async Task<ActionResult> ResetUserPassword(string code, [FromBody] string newPassword)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var removeResult = await _userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
        {
            return BadRequest("Failed to remove current password.");
        }

        var addResult = await _userManager.AddPasswordAsync(user, newPassword);
        if (!addResult.Succeeded)
        {
            return BadRequest("Failed to set new password.");
        }

        return Ok(new { message = "Password reset successfully" });
    }

    [HttpPost("update-user-language/{code}")]
    public async Task<ActionResult> UpdateUserLanguage(string code, [FromBody] string preferredLanguage)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.PreferredLanguage = preferredLanguage;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest("Failed to update user language preference.");
        }

        return Ok(new { message = "Language preference updated successfully" });
    }

    [HttpGet("debug-user-roles/{code}")]
    public async Task<ActionResult> DebugUserRoles(string code)
    {
        try
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            
            return Ok(new { 
                userCode = code,
                userName = user.UserName,
                email = user.Email,
                roles = roles,
                roleCount = roles.Count,
                firstRole = roles.FirstOrDefault()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred while debugging user roles", 
                error = ex.Message 
            });
        }
    }

    [HttpPost("fix-user-role/{code}")]
    public async Task<ActionResult> FixUserRole(string code, [FromBody] string newRole)
    {
        try
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Remove all current roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
            }

            // Add the new role
            await _userManager.AddToRoleAsync(user, newRole);
            
            return Ok(new { 
                message = $"User {code} role updated to {newRole}",
                userCode = code,
                oldRoles = currentRoles,
                newRole = newRole
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred while fixing user role", 
                error = ex.Message 
            });
        }
    }

    [HttpPost("ensure-roles")]
    public async Task<ActionResult> EnsureRolesExist()
    {
        try
        {
            var roleManager = HttpContext.RequestServices.GetRequiredService<RoleManager<AppRole>>();
            
            var roles = new[] { "Admin", "Member", "Uploader" };
            var createdRoles = new List<string>();
            
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var role = new AppRole { Name = roleName };
                    var result = await roleManager.CreateAsync(role);
                    if (result.Succeeded)
                    {
                        createdRoles.Add(roleName);
                    }
                }
            }
            
            return Ok(new { 
                message = createdRoles.Any() ? $"Created roles: {string.Join(", ", createdRoles)}" : "All roles already exist",
                createdRoles = createdRoles
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred while ensuring roles exist", 
                error = ex.Message 
            });
        }
    }

    [HttpPost("toggle-uploader-role/{code}")]
    public async Task<ActionResult> ToggleUploaderRole(string code)
    {
        try
        {
            // First ensure all roles exist
            var roleManager = HttpContext.RequestServices.GetRequiredService<RoleManager<AppRole>>();
            
            var roles = new[] { "Admin", "Member", "Uploader" };
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var role = new AppRole { Name = roleName };
                    await roleManager.CreateAsync(role);
                }
            }
            
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.CodeUser == code);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var currentRole = currentRoles.FirstOrDefault();

            // Debug logging
            Console.WriteLine($"User {code} has roles: {string.Join(", ", currentRoles)}");
            Console.WriteLine($"Current role: {currentRole}");

            string newRole;
            string message;

            if (currentRole == "Member")
            {
                // Change Member to Uploader
                await _userManager.RemoveFromRoleAsync(user, "Member");
                await _userManager.AddToRoleAsync(user, "Uploader");
                newRole = "Uploader";
                message = "User role changed from Member to Uploader";
            }
            else if (currentRole == "Uploader")
            {
                // Change Uploader to Member
                await _userManager.RemoveFromRoleAsync(user, "Uploader");
                await _userManager.AddToRoleAsync(user, "Member");
                newRole = "Member";
                message = "User role changed from Uploader to Member";
            }
            else if (currentRole == "Admin")
            {
                return BadRequest(new { message = "Cannot toggle Admin role. Admin users maintain their privileges." });
            }
            else
            {
                return BadRequest(new { message = "Only Member and Uploader roles can be toggled" });
            }

            // Send SignalR notification for role change
            Console.WriteLine($"Sending general role change notification for user {code} to role {newRole}");
            await _hubContext.Clients.All.SendAsync("ReceiveRoleChangeNotification", new
            {
                UserCode = code,
                NewRole = newRole,
                Message = message,
                Timestamp = DateTime.UtcNow
            });

            // Send direct notification to the specific user whose role changed
            Console.WriteLine($"Sending personal role change notification to group User_{code} for role {newRole}");
            await _hubContext.Clients.Group($"User_{code}").SendAsync("ReceivePersonalRoleChange", new
            {
                UserCode = code,
                NewRole = newRole,
                Message = $"تم تحديث صلاحيتك إلى: {(newRole == "Uploader" ? "رافع ملفات" : "عضو عادي")}",
                Timestamp = DateTime.UtcNow,
                RequiresReload = true
            });

            return Ok(new { 
                message = message,
                newRole = newRole,
                userCode = code
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in ToggleUploaderRole: {ex.Message}");
            return StatusCode(500, new { 
                message = "An error occurred while toggling user role", 
                error = ex.Message 
            });
        }
    }

    [HttpPost("test-signalr/{userCode}")]
    public async Task<ActionResult> TestSignalR(string userCode)
    {
        try
        {
            Console.WriteLine($"Testing SignalR notification for user: {userCode}");
            
            // Send test SignalR notification
            await _hubContext.Clients.All.SendAsync("ReceiveRoleChangeNotification", new
            {
                UserCode = userCode,
                NewRole = "TestRole",
                Message = "This is a test SignalR notification",
                Timestamp = DateTime.UtcNow
            });

            // Send test personal notification
            await _hubContext.Clients.Group($"User_{userCode}").SendAsync("ReceivePersonalRoleChange", new
            {
                UserCode = userCode,
                NewRole = "TestRole", 
                Message = "Personal test notification",
                Timestamp = DateTime.UtcNow,
                RequiresReload = false
            });

            return Ok(new { 
                message = "Test SignalR notifications sent successfully",
                userCode = userCode
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred while toggling user role", 
                error = ex.Message 
            });
        }
    }

    // [HttpPost("notifications/send-to-roles")]
    // public async Task<ActionResult> SendNotificationToRoles([FromBody] RoleNotificationDto notificationDto)
    // {
    //     try
    //     {
    //         // Get users with the specified roles
    //         var usersWithRoles = new List<AppUser>();
            
    //         foreach (var role in notificationDto.TargetRoles)
    //         {
    //             var roleUsers = await _userManager.GetUsersInRoleAsync(role);
    //             usersWithRoles.AddRange(roleUsers);
    //         }

    //         // Remove duplicates
    //         usersWithRoles = usersWithRoles.Distinct().ToList();

    //         // Create notification for each user
    //         foreach (var user in usersWithRoles)
    //         {
    //             var notification = new Notification
    //             {
    //                 UserId = user.Id,
    //                 Title = notificationDto.Title,
    //                 Message = notificationDto.Message,
    //                 Type = notificationDto.Type,
    //                 IsRead = false,
    //                 CreatedAt = DateTime.Now,
    //                 TargetId = notificationDto.TargetEntityId,
    //                 TargetType = notificationDto.TargetEntityType,
    //                 TargetUrl = notificationDto.TargetUrl
    //             };
                
    //             _context.Notifications.Add(notification);
    //         }

    //         await _context.SaveChangesAsync();

    //         return Ok(new { message = $"Notification sent to {usersWithRoles.Count} users" });
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, new { error = ex.Message });
    //     }
    // }

    // [HttpPost("notifications/send-to-user")]
    // public async Task<ActionResult> SendNotificationToUser([FromBody] UserNotificationDto notificationDto)
    // {
    //     try
    //     {
    //         var notification = new Notification
    //         {
    //             UserId = notificationDto.TargetUserId,
    //             Title = notificationDto.Title,
    //             Message = notificationDto.Message,
    //             Type = notificationDto.Type,
    //             IsRead = false,
    //             CreatedAt = DateTime.Now,
               
    //         };
            
    //        // _context.Notifications.Add(notification);
    //         await _context.SaveChangesAsync();

    //         return Ok(new { message = "Notification sent successfully" });
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, new { error = ex.Message });
    //     }
    // }
}
 