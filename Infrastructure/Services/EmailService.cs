using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Core.Interfaces;
using Infrastructure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly AppIdentityDbContext _context;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly bool _enableSsl;
        private readonly bool _useDefaultCredentials;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(
            IConfiguration config,
            AppIdentityDbContext context,
            ILogger<EmailService> logger)
        {
            _config = config;
            _context = context;
            _logger = logger;
            
            // Add null checks and default values for SMTP settings
            _smtpServer = config["SmtpSettings:Server"] ?? "localhost";
            _smtpPort = int.Parse(config["SmtpSettings:Port"] ?? "25");
            _enableSsl = bool.Parse(config["SmtpSettings:EnableSsl"] ?? "false");
            _useDefaultCredentials = bool.Parse(config["SmtpSettings:UseDefaultCredentials"] ?? "true");
            _smtpUsername = config["SmtpSettings:Username"] ?? string.Empty;
            _smtpPassword = config["SmtpSettings:Password"] ?? string.Empty;
            _fromEmail = config["SmtpSettings:SenderEmail"] ?? "noreply@documentviewer.com";
            _fromName = config["SmtpSettings:SenderName"] ?? "Document Viewer";
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                using (var client = new SmtpClient(_smtpServer, _smtpPort))
                {
                    client.EnableSsl = _enableSsl;
                    client.UseDefaultCredentials = _useDefaultCredentials;
                    client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);

                    var message = new MailMessage(new MailAddress(_fromEmail, _fromName), new MailAddress(to))
                    {
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };

                    await client.SendMailAsync(message);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {to}");
                return false;
            }
        }

        public async Task<bool> SendEmailTemplateAsync(string to, string subject, string templateName, object model)
        {
            try
            {
                // Process template body
                string body = ProcessTemplateWithModel(templateName, model);
                
                // Send the email
                return await SendEmailAsync(to, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending templated email '{templateName}' to {to}");
                return false;
            }
        }

        private string ProcessTemplateWithModel(string templateName, object model)
        {
            // Simple template processing - in real implementation, 
            // this would use a template engine like Razor or Handlebars
            string template = $"Template: {templateName}, Data: {JsonConvert.SerializeObject(model)}";
            return template;
        }

        public async Task SendTwoFactorCodeAsync(string email, string code)
        {
            var subject = "Your Two-Factor Authentication Code";
            var body = $@"
                <h2>Two-Factor Authentication Code</h2>
                <p>Your verification code is: <strong>{code}</strong></p>
                <p>This code will expire in 5 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>";

            await SendEmailAsync(email, subject, body);
        }
    }
}