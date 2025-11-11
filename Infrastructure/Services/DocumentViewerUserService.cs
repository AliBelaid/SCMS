using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities.Identity;
using Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Core.Dtos.DocumentViewer;
using Infrastructure.Identity;

namespace Infrastructure.Services
{
    public class DocumentViewerUserService : IDocumentViewerUserService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppIdentityDbContext _context;

        public DocumentViewerUserService(UserManager<AppUser> userManager, AppIdentityDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<AppUser> CreateUserAsync(CreateUserDto createUserDto)
        {
            // Check if user code already exists
            if (await IsUserCodeUniqueAsync(createUserDto.Code))
            {
                var user = new AppUser
                {
                    UserName = createUserDto.Code,
                    Email = createUserDto.Email,
                    CodeUser = createUserDto.Code,
                    IsActive = createUserDto.IsActive,
                    LastActive = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, createUserDto.Password);
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }

                // Add role
                var roleResult = await _userManager.AddToRoleAsync(user, createUserDto.Role);
                if (!roleResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);
                    throw new InvalidOperationException($"Failed to assign role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }

                return user;
            }

            throw new InvalidOperationException("User code already exists");
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<AppUser> GetUserByCodeAsync(string code)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.CodeUser == code);
        }

        public async Task<IEnumerable<AppUser>> GetAllUsersAsync()
        {
            return await _userManager.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .OrderBy(u => u.UserName)
                .ToListAsync();
        }

        public async Task<AppUser> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return null;

            user.CodeUser = updateUserDto.Code;
            user.Email = updateUserDto.Email;
            user.IsActive = updateUserDto.IsActive;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Failed to update user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            // Update role if changed
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (!currentRoles.Contains(updateUserDto.Role))
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, updateUserDto.Role);
            }

            return user;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        public async Task<bool> ActivateUserAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return false;

            user.IsActive = true;
            user.LockoutEnabled = false;
            user.LockoutEnd = null;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<bool> DeactivateUserAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
            if (user == null) return false;

            user.IsActive = false;
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.MaxValue;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<bool> ResetUserPasswordAsync(int id, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
            if (user == null) return false;

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            return result.Succeeded;
        }

        public async Task<bool> IsUserCodeUniqueAsync(string code)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.CodeUser == code);
            return existingUser == null;
        }

        public async Task<bool> ValidateUserCredentialsAsync(string code, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.CodeUser == code);
            if (user == null || !user.IsActive) return false;

            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<AppUser> GetCurrentUserAsync(int userId)
        {
            return await _userManager.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
} 