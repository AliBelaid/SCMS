using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using System;
using System.IO;

namespace API.Controllers
{    
    [AllowAnonymous]
    public class FallbackController : Controller
    {
        private readonly IFileProvider _fileProvider;
        private readonly ILogger<FallbackController> _logger;
        private readonly string _contentRootPath;

        public FallbackController(IFileProvider fileProvider, ILogger<FallbackController> logger, IWebHostEnvironment env)
        {
            _fileProvider = fileProvider ?? throw new ArgumentNullException(nameof(fileProvider));
            _logger = logger;
            _contentRootPath = env.ContentRootPath;
        }

        [HttpGet("{*path}")]
        public IActionResult Index(string path = "")
        {
            try
            {
                // Get the actual path from the request
                var requestPath = HttpContext.Request.Path.Value?.TrimStart('/') ?? "";
                
                // If this is an API route, it should have been handled by API controllers
                // Return 404 immediately without logging or processing
                if (!string.IsNullOrEmpty(requestPath) && (
                    requestPath.StartsWith("api/", StringComparison.OrdinalIgnoreCase) || 
                    requestPath.StartsWith("swagger", StringComparison.OrdinalIgnoreCase) ||
                    requestPath.StartsWith("_framework/", StringComparison.OrdinalIgnoreCase) ||
                    requestPath.StartsWith("_vs/", StringComparison.OrdinalIgnoreCase) ||
                    requestPath.StartsWith("notificationhub", StringComparison.OrdinalIgnoreCase)))
                {
                    return NotFound();
                }
                
                _logger.LogInformation($"Fallback request for path: {requestPath}");

                // If this is an API request, we don't want to return the SPA
                // This should never be reached for API routes as they should be matched by API controllers first
                if (!string.IsNullOrEmpty(requestPath) && (
                    requestPath.StartsWith("api/", StringComparison.OrdinalIgnoreCase) || 
                    requestPath.StartsWith("swagger", StringComparison.OrdinalIgnoreCase) ||
                    requestPath.StartsWith("_framework/", StringComparison.OrdinalIgnoreCase) ||
                    requestPath.StartsWith("_vs/", StringComparison.OrdinalIgnoreCase)))
                {
                    _logger.LogWarning($"FallbackController matched API/system path that should have been handled by API controllers: {requestPath}");
                    return NotFound();
                }

                // Check if path is a physical file in wwwroot
                var requestedFileInfo = _fileProvider.GetFileInfo(requestPath);
                if (requestedFileInfo.Exists && !string.IsNullOrEmpty(requestedFileInfo.PhysicalPath))
                {
                    _logger.LogInformation($"Serving file: {requestedFileInfo.PhysicalPath}");
                    var contentType = GetContentType(requestedFileInfo.Name);
                    return PhysicalFile(requestedFileInfo.PhysicalPath, contentType);
                }

                // Return the SPA index.html for all other requests to handle client-side routing
                var indexFileInfo = _fileProvider.GetFileInfo("index.html");
                if (indexFileInfo.Exists && !string.IsNullOrEmpty(indexFileInfo.PhysicalPath))
                {
                    _logger.LogInformation($"Serving SPA index.html: {indexFileInfo.PhysicalPath}");
                    return PhysicalFile(indexFileInfo.PhysicalPath, "text/html");
                }
                
                // Fallback to direct file access if IFileProvider doesn't work
                var wwwrootPath = Path.Combine(_contentRootPath, "wwwroot");
                var indexPath = Path.Combine(wwwrootPath, "index.html");
                
                if (System.IO.File.Exists(indexPath))
                {
                    _logger.LogInformation($"Serving SPA index.html via direct file access: {indexPath}");
                    return PhysicalFile(indexPath, "text/html");
                }
                
                _logger.LogWarning("Index.html not found in wwwroot directory");
                return NotFound("SPA not found. Make sure index.html exists in the wwwroot directory.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in FallbackController");
                return StatusCode(500, "Internal server error in FallbackController");
            }
        }

        private string GetContentType(string fileName)
        {
            if (fileName.EndsWith(".svg", StringComparison.OrdinalIgnoreCase))
                return "image/svg+xml";
            if (fileName.EndsWith(".css", StringComparison.OrdinalIgnoreCase))
                return "text/css";
            if (fileName.EndsWith(".js", StringComparison.OrdinalIgnoreCase))
                return "application/javascript";
            if (fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
                return "application/json";
            if (fileName.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
                return "text/html";
            if (fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                return "image/png";
            if (fileName.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || 
                fileName.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase))
                return "image/jpeg";
                
            return "application/octet-stream";
        }
    }
}
