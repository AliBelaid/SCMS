using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Identity
{
    public class AppIdentityDbContextSeed
    {
        public static async Task SeedUsersAsync(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager, ILoggerFactory loggerFactory)
        {
            try
            {
                var logger = loggerFactory.CreateLogger<AppIdentityDbContextSeed>();
                
                // Seed Roles
                try
                {
                    if (!await roleManager.Roles.AnyAsync())
                    {
                        logger.LogInformation("Starting to seed roles");
                        await SeedRolesAsync(roleManager, logger);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning($"Could not seed roles: {ex.Message}");
                }
                
                // Seed Users
                try
                {
                    if (!await userManager.Users.AnyAsync())
                    {
                        logger.LogInformation("Starting to seed users");
                        await SeedDefaultUsersAsync(userManager, logger);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning($"Could not seed users: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                var logger = loggerFactory.CreateLogger<AppIdentityDbContextSeed>();
                logger.LogError(ex, "An error occurred during user seeding");
                // Don't throw - let the application continue
            }
        }

        private static async Task SeedRolesAsync(RoleManager<AppRole> roleManager, ILogger logger)
        {
            logger.LogInformation("Creating roles");
            
            var roles = new List<AppRole>
            {
                new AppRole { Name = "Admin" },
                new AppRole { Name = "Member" },
                new AppRole { Name = "Uploader" }
            };
            
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role.Name))
                {
                    await roleManager.CreateAsync(role);
                    logger.LogInformation($"Created role: {role.Name}");
                }
            }
        }
        
        private static async Task SeedDefaultUsersAsync(UserManager<AppUser> userManager, ILogger logger)
        {
            logger.LogInformation("Creating default users");
            
            // Create Admin user
            var adminUser = new AppUser
            {
                UserName = "admin@taxmanager.com",
                Email = "admin@taxmanager.com",
                EmailConfirmed = true,
                CodeUser = "ADMIN001",
                PhoneNumber = "123456789",
                PreferredLanguage = "ar", // Default to Arabic
                IsActive = true,
                LastActive = DateTime.UtcNow
            };
            
            if (await userManager.FindByEmailAsync(adminUser.Email) == null)
            {
                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    logger.LogInformation($"Created admin user: {adminUser.Email}");
                }
                else
                {
                    logger.LogError($"Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            
            // Create 3 Member users
            var memberUsers = new List<AppUser>
            {
                new AppUser
                {
                    UserName = "member1@example.com",
                    Email = "member1@example.com",
                    EmailConfirmed = true,
                    CodeUser = "MEMBER001",
                    PhoneNumber = "555123456",
                    PreferredLanguage = "ar", // Default to Arabic
                    IsActive = true,
                    LastActive = DateTime.UtcNow
                },
                new AppUser
                {
                    UserName = "member2@example.com",
                    Email = "member2@example.com",
                    EmailConfirmed = true,
                    CodeUser = "MEMBER002",
                    PhoneNumber = "555234567",
                    PreferredLanguage = "ar", // Default to Arabic
                    IsActive = true,
                    LastActive = DateTime.UtcNow
                },
                new AppUser
                {
                    UserName = "member3@example.com",
                    Email = "member3@example.com",
                    EmailConfirmed = true,
                    CodeUser = "MEMBER003",
                    PhoneNumber = "555345678",
                    PreferredLanguage = "ar", // Default to Arabic
                    IsActive = true,
                    LastActive = DateTime.UtcNow
                }
            };
            
            foreach (var memberUser in memberUsers)
            {
                if (await userManager.FindByEmailAsync(memberUser.Email) == null)
                {
                    var result = await userManager.CreateAsync(memberUser, "Member123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(memberUser, "Member");
                        logger.LogInformation($"Created member user: {memberUser.Email}");
                    }
                    else
                    {
                        logger.LogError($"Failed to create member user {memberUser.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
            }
        }
    }
} 