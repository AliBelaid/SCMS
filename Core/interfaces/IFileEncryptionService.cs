using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IFileEncryptionService
    {
        Task<byte[]> EncryptFileAsync(byte[] fileData);
        Task<byte[]> DecryptFileAsync(byte[] encryptedData);
    }
} 