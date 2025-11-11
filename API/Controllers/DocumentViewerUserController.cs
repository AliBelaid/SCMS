using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Dtos.DocumentViewer;
using Core.Entities.Identity;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentViewerUserController : BaseController
    {
        private readonly IDocumentViewerUserService _userService;
        private readonly IMapper _mapper;

        public DocumentViewerUserController(IDocumentViewerUserService userService, IMapper mapper)
        {
            _userService = userService;
            _mapper = mapper;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequestDto loginRequest)
        {
            try
            {
                var isValid = await _userService.ValidateUserCredentialsAsync(loginRequest.Code, loginRequest.Password);
                if (!isValid)
                {
                    return Unauthorized(new { error = "Invalid credentials" });
                }

                var user = await _userService.GetUserByCodeAsync(loginRequest.Code);
                if (user == null || !user.IsActive)
                {
                    return Unauthorized(new { error = "User account is inactive" });
                }

                // Update last active
                user.LastActive = DateTime.UtcNow;
                await _userService.UpdateUserAsync(user.Id, new UpdateUserDto
                {
                    Code = user.CodeUser,
                    Email = user.Email,
                    IsActive = user.IsActive,
                    Role = user.UserRoles?.FirstOrDefault()?.Role.Name ?? "Member"
                });

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(new { user = userDto, token = "mock-jwt-token" }); // In real app, generate JWT token
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred during login" });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving users" });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null) return NotFound();

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving the user" });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var user = await _userService.CreateUserAsync(createUserDto);
                var userDto = _mapper.Map<UserDto>(user);
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the user" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _userService.UpdateUserAsync(id, updateUserDto);
                if (user == null) return NotFound();

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating the user" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id);
                if (!result) return NotFound();

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deleting the user" });
            }
        }

        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ActivateUser(int id)
        {
            try
            {
                var result = await _userService.ActivateUserAsync(id);
                if (!result) return NotFound();

                return Ok(new { message = "User activated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while activating the user" });
            }
        }

        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateUser(int id)
        {
            try
            {
                var result = await _userService.DeactivateUserAsync(id);
                if (!result) return NotFound();

                return Ok(new { message = "User deactivated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deactivating the user" });
            }
        }

        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ResetUserPassword(int id, [FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var result = await _userService.ResetUserPasswordAsync(id, resetPasswordDto.NewPassword);
                if (!result) return NotFound();

                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while resetting the password" });
            }
        }

        [HttpGet("check-code/{code}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> CheckUserCodeExists(string code)
        {
            try
            {
                var isUnique = await _userService.IsUserCodeUniqueAsync(code);
                return Ok(!isUnique); // Return true if code exists (not unique)
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while checking the user code" });
            }
        }

        [HttpGet("current")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0) return Unauthorized();

                var user = await _userService.GetCurrentUserAsync(userId);
                if (user == null) return NotFound();

                var userDto = _mapper.Map<UserDto>(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving the current user" });
            }
        }
    }

    public class LoginRequestDto
    {
        public string Code { get; set; }
        public string Password { get; set; }
    }
} 