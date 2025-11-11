using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.Identity;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Builder;
using System.IO;
using API.Extensions;
using API.Middleware;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace API {
    public class Program { 
        private static ILogger<Program> _logger;

        public static async Task Main(string[] args) {
            var host = CreateHostBuilder(args).Build();
            
            // Perform database migration and seeding
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var loggerFactory = services.GetRequiredService<ILoggerFactory>();
                _logger = loggerFactory.CreateLogger<Program>();

                try
                {
                    _logger.LogInformation("Starting application initialization and database seeding...");

                    // Get required services
                    var userManager = services.GetRequiredService<UserManager<AppUser>>();
                    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
                    var identityContext = services.GetRequiredService<AppIdentityDbContext>();
                    var environment = services.GetRequiredService<IWebHostEnvironment>();
                    var configuration = services.GetRequiredService<IConfiguration>();

                    // Debug connection string
                    var connectionString = configuration.GetConnectionString("DefaultConnection");
                    _logger.LogInformation("Connection string from configuration: {HasConnectionString}", !string.IsNullOrEmpty(connectionString));

                    // Migrate Identity database
                    await identityContext.Database.MigrateAsync();
                    
                    // Seed users (will be handled gracefully if tables don't exist)
                    try
                    {
                        await Infrastructure.Identity.AppIdentityDbContextSeed.SeedUsersAsync(userManager, roleManager, loggerFactory);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"Database seeding failed: {ex.Message}");
                    }
                    

                    
                    _logger.LogInformation("Identity database migration and seeding completed successfully.");


                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during database migration or seeding.");
                    // Don't re-throw - let the application start even if seeding fails
                    _logger.LogWarning("Database seeding failed, but application will continue to start...");
                }
            }

            await host.RunAsync();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}