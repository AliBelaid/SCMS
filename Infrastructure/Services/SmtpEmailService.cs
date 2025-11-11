using System;
using System.Threading.Tasks;
using Core.interfaces;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Services
{
    public class SmtpEmailService : ISmtpEmailService
    {
        private readonly SmtpSettings _smtpSettings;

        public SmtpEmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            try
            {
                var mail = new MailMessage
                {
                    From = new MailAddress(_smtpSettings.SenderEmail, _smtpSettings.SenderName),
                    Subject = subject,
                    Body = message,
                    IsBodyHtml = true
                };

                mail.To.Add(new MailAddress(toEmail));

                using (var client = new SmtpClient(_smtpSettings.Server, _smtpSettings.Port))
                {
                    client.EnableSsl = _smtpSettings.EnableSsl;
                    
                    if (!string.IsNullOrEmpty(_smtpSettings.Username) && !string.IsNullOrEmpty(_smtpSettings.Password))
                    {
                        client.Credentials = new NetworkCredential(_smtpSettings.Username, _smtpSettings.Password);
                    }
                    else
                    {
                        client.UseDefaultCredentials = true;
                    }

                    await client.SendMailAsync(mail);
                }
            }
            catch (Exception ex)
            {
                // Log the exception, but don't interrupt the application flow
                Console.WriteLine($"Error sending email: {ex.Message}");
            }
        }
    }
} 