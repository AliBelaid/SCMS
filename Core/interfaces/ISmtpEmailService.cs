using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.interfaces
{
    public interface ISmtpEmailService
    {
  Task SendEmailAsync(string toEmail, string subject, string message);

    }
}