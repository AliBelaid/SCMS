using System.Text.Json;
using System.Text.Json.Serialization;
using API.Controllers;
using API.Dtos;
using API.Errors;
using API.Extensions;
using API.Hubs;
using API.Services;
using Core.Entities.Identity;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Identity;
using API.Helpers;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Http.Features;
using Swashbuckle.AspNetCore.Swagger;

public class Startup
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public Startup(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        // Register IFileProvider early to ensure it's available for all services
        var wwwRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
        services.AddSingleton<IFileProvider>(new PhysicalFileProvider(wwwRootPath));

        services.AddControllers().AddNewtonsoftJson(opt =>
        {
            opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        });

        services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.PropertyNameCaseInsensitive = false;
            options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals;
            options.JsonSerializerOptions.WriteIndented = true;
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        });

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAllOrigins",
                builder => builder.SetIsOriginAllowed(_ => true)
                                  .AllowAnyMethod()
                                  .AllowAnyHeader()
                                  .AllowCredentials());
        });

        services.AddAutoMapper(typeof(MappingProfiles));
        services.AddApplicationServices(_configuration);
        services.AddIdentityServices(_configuration);
        services.AddMemoryCache();
        
        // Add SignalR
        services.AddSignalR();
        
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "DMSMS API", Version = "v1" });

            c.CustomSchemaIds(type => type.FullName);

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });
        });

        services.AddSingleton<EncryptionService>(new EncryptionService("your-32-characters-long-key-here", "1234567890123456"));

        services.AddSpaStaticFiles(configuration =>
        {
            configuration.RootPath = "wwwroot";
        });

        services.Configure<OpenAIConfig>(_configuration.GetSection("OpenAI"));
        services.AddHttpClient("OpenAI", client =>
        {
            client.BaseAddress = new Uri("https://api.openai.com/");
        });

        services.Configure<IISServerOptions>(options =>
        {
            options.AllowSynchronousIO = true;
            options.MaxRequestBodySize = 300 * 1024 * 1024; // 300MB
        });

        services.Configure<IISOptions>(options =>
        {
            options.ForwardClientCertificate = false;
            options.AutomaticAuthentication = false;
        });

        // Configure Kestrel for larger file uploads
        services.Configure<KestrelServerOptions>(options =>
        {
            options.Limits.MaxRequestBodySize = 300 * 1024 * 1024; // 300MB
            options.Limits.MaxConcurrentConnections = 100;
            options.Limits.MaxConcurrentUpgradedConnections = 100;
        });

        // Configure form options for larger file uploads
        services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = 300 * 1024 * 1024; // 300MB
            options.ValueLengthLimit = int.MaxValue;
            options.MemoryBufferThreshold = 64 * 1024; // 64KB buffer
        });

     }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.Use(async (context, next) =>
        {
            context.Request.Headers.Remove("X-Forwarded-Protocol");
            context.Request.Headers.Remove("X-WebDAV-Request");
            await next();
        });

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c => 
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
                c.InjectStylesheet("/swagger-ui/swagger-ui.css");
                c.InjectJavascript("/swagger-ui/swagger-ui-standalone-preset.js");
            });
        }
        else
        {
            app.UseExceptionHandler("/Error");
            app.UseHsts();
        }        
        app.UseMiddleware<ExceptionMiddleware>();
        app.UseStatusCodePagesWithReExecute("/errors/{0}");
        
        app.UseHttpsRedirection();
        
        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = ctx =>
            {
                ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=86400");
            },
            ServeUnknownFileTypes = true
        });
        
        app.UseSpaStaticFiles();
        
        app.UseRouting();
        
        app.UseCors("AllowAllOrigins");
        
        app.UseAuthentication();
        app.UseAuthorization();
        
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<NotificationHub>("/notificationHub");
        });

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "wwwroot";
            if (env.IsDevelopment())
            {
                spa.UseProxyToSpaDevelopmentServer("http://localhost:4400");
            }
        });
    }
}
