using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace API.Helpers
{
    /// <summary>
    /// AutoMapper value resolver to convert relative image paths to full URLs
    /// </summary>
    public class ImageUrlResolver : IValueResolver<object, object, string?>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public ImageUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string? Resolve(object source, object destination, string? destMember, ResolutionContext context)
        {
            if (destMember == null || string.IsNullOrWhiteSpace(destMember))
                return null;

            // If already a full URL, return as is
            if (destMember.StartsWith("http://") || destMember.StartsWith("https://"))
                return destMember;

            // Get base URL from configuration or use default
            var baseUrl = _configuration["ApiBaseUrl"] 
                ?? _configuration["AppSettings:ApiBaseUrl"]
                ?? "http://localhost:5000";

            // Remove trailing slash from base URL
            baseUrl = baseUrl.TrimEnd('/');

            // Remove leading slash from image path if present
            var imagePath = destMember.TrimStart('/');

            // Return full URL
            return $"{baseUrl}/{imagePath}";
        }
    }

    /// <summary>
    /// AutoMapper value resolver specifically for Visitor Person Image URLs
    /// </summary>
    public class VisitorPersonImageUrlResolver : IValueResolver<Core.Entities.VisitorManagement.Visitor, Core.Dtos.VisitorManagement.VisitorDto, string?>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public VisitorPersonImageUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string? Resolve(Core.Entities.VisitorManagement.Visitor source, Core.Dtos.VisitorManagement.VisitorDto destination, string? destMember, ResolutionContext context)
        {
            if (source.PersonImageUrl == null || string.IsNullOrWhiteSpace(source.PersonImageUrl))
                return null;

            return ResolveImageUrl(source.PersonImageUrl);
        }

        private string? ResolveImageUrl(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
                return imagePath;

            // Get base URL from configuration - check ApiUrl first (matches appsettings.json)
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";

            baseUrl = baseUrl.TrimEnd('/');
            imagePath = imagePath.TrimStart('/');

            return $"{baseUrl}/{imagePath}";
        }
    }

    /// <summary>
    /// AutoMapper value resolver for Visitor ID Card Image URLs
    /// </summary>
    public class VisitorIdCardImageUrlResolver : IValueResolver<Core.Entities.VisitorManagement.Visitor, Core.Dtos.VisitorManagement.VisitorDto, string?>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public VisitorIdCardImageUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string? Resolve(Core.Entities.VisitorManagement.Visitor source, Core.Dtos.VisitorManagement.VisitorDto destination, string? destMember, ResolutionContext context)
        {
            if (source.IdCardImageUrl == null || string.IsNullOrWhiteSpace(source.IdCardImageUrl))
                return null;

            return ResolveImageUrl(source.IdCardImageUrl);
        }

        private string? ResolveImageUrl(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
                return imagePath;

            // Get base URL from configuration - check ApiUrl first (matches appsettings.json)
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";

            baseUrl = baseUrl.TrimEnd('/');
            imagePath = imagePath.TrimStart('/');

            return $"{baseUrl}/{imagePath}";
        }
    }

    /// <summary>
    /// AutoMapper value resolver for Visit Car Image URLs
    /// </summary>
    public class VisitCarImageUrlResolver : IValueResolver<Core.Entities.VisitorManagement.Visit, Core.Dtos.VisitorManagement.VisitDto, string?>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public VisitCarImageUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string? Resolve(Core.Entities.VisitorManagement.Visit source, Core.Dtos.VisitorManagement.VisitDto destination, string? destMember, ResolutionContext context)
        {
            if (source.CarImageUrl == null || string.IsNullOrWhiteSpace(source.CarImageUrl))
                return null;

            return ResolveImageUrl(source.CarImageUrl);
        }

        private string? ResolveImageUrl(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
                return imagePath;

            // Get base URL from configuration - check ApiUrl first (matches appsettings.json)
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";

            baseUrl = baseUrl.TrimEnd('/');
            imagePath = imagePath.TrimStart('/');

            return $"{baseUrl}/{imagePath}";
        }
    }

    /// <summary>
    /// AutoMapper value resolver for Order Attachment File URLs
    /// </summary>
    public class OrderAttachmentFileUrlResolver : IValueResolver<Core.Entities.DocumentManagement.OrderAttachment, Core.Dtos.DocumentManagement.OrderAttachmentDto, string>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public OrderAttachmentFileUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string Resolve(Core.Entities.DocumentManagement.OrderAttachment source, Core.Dtos.DocumentManagement.OrderAttachmentDto destination, string destMember, ResolutionContext context)
        {
            // Get base URL from configuration - check ApiUrl first (matches appsettings.json)
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";
            
            baseUrl = baseUrl.TrimEnd('/');
            
            // Remove trailing slash
            baseUrl = baseUrl.TrimEnd('/');

            // Construct the file URL based on whether DocumentId exists
            if (source.DocumentId.HasValue)
            {
                // Use DocumentViewer endpoint if DocumentId exists
                return $"{baseUrl}/api/DocumentViewer/{source.DocumentId}/serve";
            }
            else
            {
                // Extract relative path from wwwroot
                var relativePath = GetRelativePathFromWwwRoot(source.FilePath);
                
                if (!string.IsNullOrEmpty(relativePath))
                {
                    // Use direct file URL like visitor images: {baseUrl}/{relativePath}
                    // e.g., https://localhost:5001/FileStorage/Documents/filename.png
                    return $"{baseUrl}/{relativePath.Replace('\\', '/')}";
                }
                else
                {
                    // Fallback to attachment endpoint if path extraction fails
                    return $"{baseUrl}/api/orders/attachments/{source.Id}/serve";
                }
            }
        }

        private string? GetRelativePathFromWwwRoot(string fullPath)
        {
            if (string.IsNullOrWhiteSpace(fullPath))
                return null;

            // Normalize path separators
            var normalizedPath = fullPath.Replace('\\', '/');

            // If already a relative path (starts with FileStorage or doesn't contain drive letter)
            if (normalizedPath.StartsWith("FileStorage", StringComparison.OrdinalIgnoreCase))
            {
                return normalizedPath.TrimStart('/');
            }

            // Find wwwroot in the path
            var wwwrootIndex = normalizedPath.IndexOf("/wwwroot/", StringComparison.OrdinalIgnoreCase);
            if (wwwrootIndex >= 0)
            {
                // Extract everything after /wwwroot/
                var relativePath = normalizedPath.Substring(wwwrootIndex + 9); // "/wwwroot/" length
                return relativePath.TrimStart('/');
            }

            // Try to find wwwroot without leading slash
            wwwrootIndex = normalizedPath.IndexOf("wwwroot/", StringComparison.OrdinalIgnoreCase);
            if (wwwrootIndex >= 0)
            {
                var relativePath = normalizedPath.Substring(wwwrootIndex + 8); // "wwwroot/" length
                return relativePath.TrimStart('/');
            }

            // Try to find wwwroot at any position
            wwwrootIndex = normalizedPath.IndexOf("wwwroot", StringComparison.OrdinalIgnoreCase);
            if (wwwrootIndex >= 0)
            {
                var relativePath = normalizedPath.Substring(wwwrootIndex + 7); // "wwwroot" length
                return relativePath.TrimStart('/');
            }

            // If no wwwroot found, check if it's already a relative path
            // (e.g., FileStorage/Documents/file.png)
            if (!normalizedPath.Contains(":") && !normalizedPath.StartsWith("/"))
            {
                return normalizedPath;
            }

            return null;
        }
    }

    /// <summary>
    /// AutoMapper value resolver for Employee Card Image URLs
    /// </summary>
    public class EmployeeCardImageUrlResolver : IValueResolver<Core.Entities.VisitorManagement.Employee, Core.Dtos.VisitorManagement.EmployeeDto, string?>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public EmployeeCardImageUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string? Resolve(Core.Entities.VisitorManagement.Employee source, Core.Dtos.VisitorManagement.EmployeeDto destination, string? destMember, ResolutionContext context)
        {
            if (source.CardImageUrl == null || string.IsNullOrWhiteSpace(source.CardImageUrl))
                return null;

            return ResolveImageUrl(source.CardImageUrl);
        }

        private string? ResolveImageUrl(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
                return imagePath;

            // Get base URL from configuration - check ApiUrl first (matches appsettings.json)
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";

            baseUrl = baseUrl.TrimEnd('/');
            imagePath = imagePath.TrimStart('/');

            return $"{baseUrl}/{imagePath}";
        }
    }

    /// <summary>
    /// AutoMapper value resolver for Employee Face Image URLs
    /// </summary>
    public class EmployeeFaceImageUrlResolver : IValueResolver<Core.Entities.VisitorManagement.Employee, Core.Dtos.VisitorManagement.EmployeeDto, string?>
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public EmployeeFaceImageUrlResolver(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public string? Resolve(Core.Entities.VisitorManagement.Employee source, Core.Dtos.VisitorManagement.EmployeeDto destination, string? destMember, ResolutionContext context)
        {
            if (source.FaceImageUrl == null || string.IsNullOrWhiteSpace(source.FaceImageUrl))
                return null;

            return ResolveImageUrl(source.FaceImageUrl);
        }

        private string? ResolveImageUrl(string? imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            if (imagePath.StartsWith("http://") || imagePath.StartsWith("https://"))
                return imagePath;

            // Get base URL from configuration - check ApiUrl first (matches appsettings.json)
            var baseUrl = _configuration["ApiUrl"] 
                ?? _configuration["ApiBaseUrl"]
                ?? _configuration["AppSettings:ApiUrl"]
                ?? "http://localhost:5000";

            baseUrl = baseUrl.TrimEnd('/');
            imagePath = imagePath.TrimStart('/');

            return $"{baseUrl}/{imagePath}";
        }
    }
}

