using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace API.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public FileService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment ?? throw new ArgumentNullException(nameof(webHostEnvironment));
        }

        public async Task<string> SaveFileAsync(IFormFile file)
        {
            if (file == null || file.Length <= 0)
            {
                return null;
            }

            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads");
          //  var fileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
            var filePath = Path.Combine(uploadsFolder, Path.GetFileName(file.FileName));

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Path.GetFileName(file.FileName);
        }

        public async Task<byte[]> LoadFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                return null;
            }

            var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", filePath);

            if (!File.Exists(fullPath))
            {
                return null;
            }

            return await File.ReadAllBytesAsync(fullPath);
        }


              public async Task<bool> DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                return false;
            }

            var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", filePath);

            if (!File.Exists(fullPath))
            {
                return false; // File not found
            }

            try
            {
                File.Delete(fullPath);
                return true; // File deleted successfully
            }
            catch (Exception ex)
            {
                // Handle exceptions (e.g., file in use, access denied)
                // You can log the exception details here for debugging
                return false; // Failed to delete the file
            }
        }
    }
}
