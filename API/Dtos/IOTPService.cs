using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Dtos
{
    public interface IOtpService
{
    Task<string> GenerateOtpAsync(string identifier);
    bool ValidateOtp(string identifier, string otp);
}
public class VerifyOTPModel
{
    public string Identifier { get; set; } // يمكن أن يكون رقم هاتف أو بريد إلكتروني
    public string OTP { get; set; }
}

}