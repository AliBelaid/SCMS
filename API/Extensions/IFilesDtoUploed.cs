using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file);
        Task<byte[]> LoadFileAsync(string filePath);
        Task<bool> DeleteFileAsync(string filePath); // Add this method

    }
}
