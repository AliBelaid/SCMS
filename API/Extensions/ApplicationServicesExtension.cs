using System.Linq;
using API.Errors;
using API.Helpers;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Identity;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using API.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class ApplicationServicesExtension
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
                    services.AddScoped<IDocumentViewerUserService, DocumentViewerUserService>();
            services.AddScoped<IFileEncryptionService, FileEncryptionService>();
            services.AddScoped<Core.Interfaces.IEmailService, Infrastructure.Services.EmailService>();
            
            // Document Viewer Services
            services.AddScoped<IDocumentService, DocumentService>();
            services.AddScoped<IOrderPermissionService, OrderPermissionService>();
            services.AddScoped<IOrderExpirationService, OrderExpirationService>();
            services.AddScoped<IOrderActivityLogService, OrderActivityLogService>();
            services.AddOrderHistoryServices();
            services.AddScoped<API.Extensions.IUserRepository, API.Extensions.UserRepository>();
            services.AddScoped<Core.Interfaces.IUserRepository>(sp =>
                (Core.Interfaces.IUserRepository)sp.GetRequiredService<API.Extensions.IUserRepository>());


            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = actionContext =>
                {
                    var errors = actionContext.ModelState
                        .Where(e => e.Value.Errors.Count > 0)
                        .SelectMany(x => x.Value.Errors)
                        .Select(x => x.ErrorMessage).ToArray();

                    var errorResponse = new ApiValidationErrorResponse
                    {
                        Errors = errors
                    };

                    return new BadRequestObjectResult(errorResponse);
                };
            });

            return services;
        }
    }
}