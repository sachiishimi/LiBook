using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net;
using System.Net.Mail;
using System.Configuration;

namespace LiBook.Helpers
{
    public static class EmailHelper
    {
        // Send a simple HTML email
        public static void SendEmail(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // From address is read from web.config mailSettings smtp from attribute
                var fromAddress = ConfigurationManager.AppSettings["FromEmail"]; // optional fallback
                var smtpSection = (System.Net.Configuration.SmtpSection)ConfigurationManager.GetSection("system.net/mailSettings/smtp");

                string from = smtpSection.From ?? fromAddress ?? "no-reply@yourdomain.com";

                using (var msg = new MailMessage())
                {
                    msg.From = new MailAddress(from);
                    msg.To.Add(new MailAddress(toEmail));
                    msg.Subject = subject;
                    msg.Body = htmlBody;
                    msg.IsBodyHtml = true;

                    using (var client = new SmtpClient())
                    {
                        // SmtpClient will automatically use system.net/mailSettings by default when constructed with no args.
                        // If you want to override, set client.Host, client.Port, etc. here.

                        client.Send(msg); // synchronous. For non-blocking, see the async option below.
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the exception (replace with your logger)
                // For now, rethrow or swallow depending on your error strategy:
                throw new InvalidOperationException("Failed to send email: " + ex.Message, ex);
            }
        }

        // Optional: async version (non-blocking)
        public static async System.Threading.Tasks.Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var smtpSection = (System.Net.Configuration.SmtpSection)ConfigurationManager.GetSection("system.net/mailSettings/smtp");
            string from = smtpSection.From ?? "no-reply@yourdomain.com";

            using (var msg = new MailMessage())
            {
                msg.From = new MailAddress(from);
                msg.To.Add(toEmail);
                msg.Subject = subject;
                msg.Body = htmlBody;
                msg.IsBodyHtml = true;

                using (var client = new SmtpClient())
                {
                    await client.SendMailAsync(msg);
                }
            }
        }
    }
}