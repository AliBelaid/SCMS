  using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace API.Dtos
{

public class EncryptionService
{
    private readonly byte[] key;
    private readonly byte[] iv;

    public EncryptionService(string keyValue, string ivValue)
    {
        if (keyValue == null || ivValue == null)
        {
            throw new ArgumentNullException("Key and IV must not be null.");
        }

        key = Encoding.UTF8.GetBytes(keyValue);

        // تأكد من أن طول ivValue هو 16 بايت
        if (Encoding.UTF8.GetBytes(ivValue).Length != 16)
        {
            throw new ArgumentException("IV must be exactly 16 bytes long.");
        }
        iv = Encoding.UTF8.GetBytes(ivValue);
    }

    public string EncryptString(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            throw new ArgumentNullException("plainText");

        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = key;
            aesAlg.IV = iv;

            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            using (var msEncrypt = new MemoryStream())
            {
                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                using (var swEncrypt = new StreamWriter(csEncrypt))
                {
                    swEncrypt.Write(plainText);
                }

                var encrypted = msEncrypt.ToArray();
                return Convert.ToBase64String(encrypted);
            }
        }
    }

    public string DecryptString(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            throw new ArgumentNullException("cipherText");

        var buffer = Convert.FromBase64String(cipherText);

        using (Aes aesAlg = Aes.Create())
        {
            aesAlg.Key = key;
            aesAlg.IV = iv;

            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

            using (var msDecrypt = new MemoryStream(buffer))
            using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
            using (var srDecrypt = new StreamReader(csDecrypt))
            {
                var plaintext = srDecrypt.ReadToEnd();
                return plaintext;
            }
        }
    }
}
}