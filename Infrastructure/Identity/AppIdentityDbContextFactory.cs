using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using System;

namespace Infrastructure.Identity
{
    public class AppIdentityDbContextFactory : IDesignTimeDbContextFactory<AppIdentityDbContext>
    {
        public AppIdentityDbContext CreateDbContext(string[] args)
        {
            // Try multiple paths to find the API project
            var possiblePaths = new[]
            {
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "API")),
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "API")),
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../../API")),
                Directory.GetCurrentDirectory()
            };

            string apiPath = null;
            foreach (var path in possiblePaths)
            {
                if (File.Exists(Path.Combine(path, "appsettings.json")))
                {
                    apiPath = path;
                    break;
                }
            }

            if (apiPath == null)
            {
                throw new FileNotFoundException("Could not find appsettings.json in any expected location");
            }

            Console.WriteLine($"Using appsettings.json from: {apiPath}");

            var builder = new ConfigurationBuilder()
                .SetBasePath(apiPath)
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables();

            var configuration = builder.Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppIdentityDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            Console.WriteLine($"Connection string found: {!string.IsNullOrEmpty(connectionString)}");
            
            // If connection string is not found, use a default one for migrations
            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = "Server=.;Database=DocumentViewer;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";
                Console.WriteLine("Warning: Using default connection string for migrations as no connection string found in appsettings.json");
            }
            
            optionsBuilder.UseSqlServer(connectionString);

            return new AppIdentityDbContext(optionsBuilder.Options);
        }
    }
} 