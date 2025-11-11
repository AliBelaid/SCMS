using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.Identity;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions;

public static class IdentityServiceExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppIdentityDbContext>(options =>
        {
            options.UseSqlServer(
                config.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.CommandTimeout(120) // Set timeout to 120 seconds
            );
        });     
 
        // Configure identity
        services.AddIdentityCore<Core.Entities.Identity.AppUser>(opt =>
        {
            // Relax password policy to allow weak/simple passwords like "123"
            opt.Password.RequireDigit = false;
            opt.Password.RequireLowercase = false;
            opt.Password.RequireUppercase = false;
            opt.Password.RequireNonAlphanumeric = false;
            opt.Password.RequiredLength = 3;
        })
        .AddRoles<Core.Entities.Identity.AppRole>()
        .AddRoleManager<RoleManager<Core.Entities.Identity.AppRole>>()
        .AddSignInManager<SignInManager<Core.Entities.Identity.AppUser>>()
        .AddEntityFrameworkStores<AppIdentityDbContext>();

        // Ensure IdentityOptions are applied globally (covers all password validators)
        services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 3;
        });

        // Configure JWT authentication
        services.AddAuthentication(options => 
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Token:Key"])),
                ValidIssuer = config["Token:Issuer"],
                ValidateIssuer = true,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers.Append("Token-Expired", "true");
                    }
                    return Task.CompletedTask;
                }
            };
        });

        // Configure authorization policies
        services.AddAuthorization(opt =>
        {
            opt.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
            opt.AddPolicy("RequireSecurityRole", policy => policy.RequireRole("Security"));
            opt.AddPolicy("RequireCommitteeRole", policy => policy.RequireRole("Committee"));
            opt.AddPolicy("RequireInspectorRole", policy => policy.RequireRole("Inspector"));
            opt.AddPolicy("RequireWeaponManagerRole", policy => policy.RequireRole("WeaponManager"));
            
            // Combined policies
            opt.AddPolicy("RequireSecurityOrAdmin", policy => 
                policy.RequireRole("Security", "Admin"));
            opt.AddPolicy("RequireCommitteeOrAdmin", policy => 
                policy.RequireRole("Committee", "Admin"));
            opt.AddPolicy("RequireInspectorOrAdmin", policy => 
                policy.RequireRole("Inspector", "Admin"));
        });

        return services;
    }
}
