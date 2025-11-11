// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using System;
// using System.IO;
// using System.Security.Cryptography;
// using System.Text;
// namespace API.Dtos
// {
//    public class EncryptionService
// {
//     // Previous encryption and decryption methods here

//     public string GenerateEncryptedOTP(string identifier)
//     {
//         var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
//         var payload = $"{identifier}:{timestamp}";
//         return EncryptString(payload);
//     }

//     public (bool IsValid, string Identifier) VerifyEncryptedOTP(string encryptedOtp, int expirySeconds = 60)
//     {
//         try
//         {
//             var decrypted = DecryptString(encryptedOtp);
//             var parts = decrypted.Split(':');
//             if (parts.Length == 2)
//             {
//                 var identifier = parts[0];
//                 var timestamp = long.Parse(parts[1]);
//                 var currentTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

//                 if (currentTimestamp - timestamp <= expirySeconds)
//                 {
//                     return (true, identifier);
//                 }
//             }
//         }
//         catch
//         {
//             // Log or handle decryption and parsing errors
//         }

//         return (false, null);
//     }
// }
// }