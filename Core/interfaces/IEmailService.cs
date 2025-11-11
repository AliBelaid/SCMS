using System.Threading.Tasks;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body);
        Task<bool> SendEmailTemplateAsync(string to, string subject, string templateName, object model);
        Task SendTwoFactorCodeAsync(string email, string code);
    }
}