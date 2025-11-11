using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Core.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;

namespace API.Dtos
{
    public class OtpService : IOtpService
    {
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;
        private readonly int _otpExpirationMinutes = 5;

        public OtpService(
            IEmailService emailService,
            IMemoryCache cache)
        {
            _emailService = emailService;
            _cache = cache;
        }

        public async Task<string> GenerateOtpAsync(string identifier)
        {
            var normalizedEmail = identifier.Trim().ToLowerInvariant();

            if (!IsValidEmail(normalizedEmail))
                throw new ArgumentException("Invalid email address");

            var rnd = new Random();
            var otp = rnd.Next(0, 10000).ToString("D4");
            
            // Store in cache with expiration
            _cache.Set(normalizedEmail, otp, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_otpExpirationMinutes)
            });

            await SendOtpEmailAsync(normalizedEmail, otp);
            return otp;
        }

        public bool ValidateOtp(string identifier, string otp)
        {
            var normalizedEmail = identifier.Trim().ToLowerInvariant();
            var cleanedOtp = otp.Trim();

            if (!_cache.TryGetValue(normalizedEmail, out string storedOtp))
                return false;

            // Remove OTP after validation attempt
            _cache.Remove(normalizedEmail);

            return storedOtp == cleanedOtp;
        }

        private async Task SendOtpEmailAsync(string email, string otp)
        {
            var subject = "Your Verification Code";
            var message = $"Your verification code is: {otp}";
            await _emailService.SendEmailAsync(email, subject, message);
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
                return Regex.IsMatch(email, pattern, RegexOptions.IgnoreCase);
            }
            catch
            {
                return false;
            }
        }
    }
}