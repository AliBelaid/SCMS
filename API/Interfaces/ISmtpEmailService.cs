using System.Threading.Tasks;

namespace API.Interfaces
{
    public interface ISmtpEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendEmailWithAttachmentAsync(string to, string subject, string body, string attachmentPath);
    }
} 