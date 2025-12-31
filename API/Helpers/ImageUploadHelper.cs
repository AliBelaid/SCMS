using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace API.Helpers
{
    /// <summary>
    /// Helper class for uploading and saving images to wwwroot
    /// </summary>
    public static class ImageUploadHelper
    {
        /// <summary>
        /// Save base64 image to wwwroot/pos/imagesPerson/ folder
        /// Returns the relative URL path
        /// </summary>
        public static async Task<string?> SavePersonImageAsync(string base64Image, string visitorId, IWebHostEnvironment environment)
        {
            if (string.IsNullOrWhiteSpace(base64Image))
                return null;

            try
            {
                // Remove data URL prefix if present
                var base64Data = base64Image.Contains(",") 
                    ? base64Image.Split(',')[1] 
                    : base64Image;

                // Decode base64
                var imageBytes = Convert.FromBase64String(base64Data);

                // Create directory if it doesn't exist
                var imagesDir = Path.Combine(environment.WebRootPath, "pos", "imagesPerson");
                Directory.CreateDirectory(imagesDir);

                // Generate unique filename
                var fileName = $"person_{visitorId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}.jpg";
                var filePath = Path.Combine(imagesDir, fileName);

                // Save file
                await File.WriteAllBytesAsync(filePath, imageBytes);

                // Return relative URL
                return $"/pos/imagesPerson/{fileName}";
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request
                Console.WriteLine($"Error saving person image: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Save base64 image to wwwroot/pos/imagesCar/ folder
        /// Returns the relative URL path
        /// </summary>
        public static async Task<string?> SaveCarImageAsync(string base64Image, string visitNumber, IWebHostEnvironment environment)
        {
            if (string.IsNullOrWhiteSpace(base64Image))
                return null;

            try
            {
                // Remove data URL prefix if present
                var base64Data = base64Image.Contains(",") 
                    ? base64Image.Split(',')[1] 
                    : base64Image;

                // Decode base64
                var imageBytes = Convert.FromBase64String(base64Data);

                // Create directory if it doesn't exist
                var imagesDir = Path.Combine(environment.WebRootPath, "pos", "imagesCar");
                Directory.CreateDirectory(imagesDir);

                // Generate unique filename
                var fileName = $"car_{visitNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}.jpg";
                var filePath = Path.Combine(imagesDir, fileName);

                // Save file
                await File.WriteAllBytesAsync(filePath, imageBytes);

                // Return relative URL
                return $"/pos/imagesCar/{fileName}";
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request
                Console.WriteLine($"Error saving car image: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Save ID card image to wwwroot/pos/imagesPerson/ folder
        /// Returns the relative URL path
        /// </summary>
        public static async Task<string?> SaveIdCardImageAsync(string base64Image, string visitorId, IWebHostEnvironment environment)
        {
            if (string.IsNullOrWhiteSpace(base64Image))
                return null;

            try
            {
                // Remove data URL prefix if present
                var base64Data = base64Image.Contains(",") 
                    ? base64Image.Split(',')[1] 
                    : base64Image;

                // Decode base64
                var imageBytes = Convert.FromBase64String(base64Data);

                // Create directory if it doesn't exist
                var imagesDir = Path.Combine(environment.WebRootPath, "pos", "imagesPerson");
                Directory.CreateDirectory(imagesDir);

                // Generate unique filename
                var fileName = $"idcard_{visitorId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}.jpg";
                var filePath = Path.Combine(imagesDir, fileName);

                // Save file
                await File.WriteAllBytesAsync(filePath, imageBytes);

                // Return relative URL
                return $"/pos/imagesPerson/{fileName}";
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request
                Console.WriteLine($"Error saving ID card image: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Save employee card image to wwwroot/pos/imagesEmployee/cards/ folder
        /// Returns the relative URL path
        /// </summary>
        public static async Task<string?> SaveEmployeeCardImageAsync(string base64Image, string employeeId, IWebHostEnvironment environment)
        {
            if (string.IsNullOrWhiteSpace(base64Image))
                return null;

            try
            {
                var base64Data = base64Image.Contains(",") 
                    ? base64Image.Split(',')[1] 
                    : base64Image;

                var imageBytes = Convert.FromBase64String(base64Data);

                var imagesDir = Path.Combine(environment.WebRootPath, "pos", "imagesEmployee", "cards");
                Directory.CreateDirectory(imagesDir);

                var fileName = $"card_{employeeId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}.jpg";
                var filePath = Path.Combine(imagesDir, fileName);

                await File.WriteAllBytesAsync(filePath, imageBytes);

                return $"/pos/imagesEmployee/cards/{fileName}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving employee card image: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Save employee face image to wwwroot/pos/imagesEmployee/faces/ folder
        /// Returns the relative URL path
        /// </summary>
        public static async Task<string?> SaveEmployeeFaceImageAsync(string base64Image, string employeeId, IWebHostEnvironment environment)
        {
            if (string.IsNullOrWhiteSpace(base64Image))
                return null;

            try
            {
                var base64Data = base64Image.Contains(",") 
                    ? base64Image.Split(',')[1] 
                    : base64Image;

                var imageBytes = Convert.FromBase64String(base64Data);

                var imagesDir = Path.Combine(environment.WebRootPath, "pos", "imagesEmployee", "faces");
                Directory.CreateDirectory(imagesDir);

                var fileName = $"face_{employeeId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}.jpg";
                var filePath = Path.Combine(imagesDir, fileName);

                await File.WriteAllBytesAsync(filePath, imageBytes);

                return $"/pos/imagesEmployee/faces/{fileName}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving employee face image: {ex.Message}");
                return null;
            }
        }
    }
}

