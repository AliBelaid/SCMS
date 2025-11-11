using System;
using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Core.Interfaces;

namespace Infrastructure.Services
{
    public class FileEncryptionService : IFileEncryptionService
    {
        private readonly string _keyPath;
        private readonly string _ivPath;

        public FileEncryptionService(IConfiguration configuration)
        {
            _keyPath = configuration["FileEncryption:KeyPath"];
            _ivPath = configuration["FileEncryption:IVPath"];
            InitializeKeyAndIV();
        }

        private void InitializeKeyAndIV()
        {
            if (!File.Exists(_keyPath) || !File.Exists(_ivPath))
            {
                using (Aes aes = Aes.Create())
                {
                    File.WriteAllBytes(_keyPath, aes.Key);
                    File.WriteAllBytes(_ivPath, aes.IV);
                }
            }
        }

        public async Task<byte[]> EncryptFileAsync(byte[] fileData)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = await File.ReadAllBytesAsync(_keyPath);
                aes.IV = await File.ReadAllBytesAsync(_ivPath);

                using (MemoryStream msOutput = new MemoryStream())
                using (CryptoStream cs = new CryptoStream(msOutput, aes.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    await cs.WriteAsync(fileData, 0, fileData.Length);
                    cs.FlushFinalBlock();
                    return msOutput.ToArray();
                }
            }
        }

        public async Task<byte[]> DecryptFileAsync(byte[] encryptedData)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = await File.ReadAllBytesAsync(_keyPath);
                aes.IV = await File.ReadAllBytesAsync(_ivPath);

                using (MemoryStream msOutput = new MemoryStream())
                using (CryptoStream cs = new CryptoStream(msOutput, aes.CreateDecryptor(), CryptoStreamMode.Write))
                {
                    await cs.WriteAsync(encryptedData, 0, encryptedData.Length);
                    cs.FlushFinalBlock();
                    return msOutput.ToArray();
                }
            }
        }
    }
} 