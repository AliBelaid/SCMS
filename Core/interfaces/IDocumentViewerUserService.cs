using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities.Identity;
using Core.Dtos.DocumentViewer;

namespace Core.Interfaces
{
    public interface IDocumentViewerUserService
    {
        Task<AppUser> CreateUserAsync(CreateUserDto createUserDto);
        Task<AppUser> GetUserByIdAsync(int id);
        Task<AppUser?> GetUserByCodeAsync(string code);
        Task<IEnumerable<AppUser>> GetAllUsersAsync();
        Task<AppUser?> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> ActivateUserAsync(int id);
        Task<bool> DeactivateUserAsync(int id);
        Task<bool> ResetUserPasswordAsync(int id, string newPassword);
        Task<bool> IsUserCodeUniqueAsync(string code);
        Task<bool> ValidateUserCredentialsAsync(string code, string password);
        Task<AppUser?> GetCurrentUserAsync(int userId);
    }
} 