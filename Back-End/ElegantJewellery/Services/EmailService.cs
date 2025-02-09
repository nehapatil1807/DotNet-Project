using Microsoft.Extensions.Options;
using System.Net.Mail;
using System.Net;

namespace ElegantJewellery.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
            {
                Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message);
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName)
        {
            var subject = "Welcome to Elegant Jewellery!";
            var body = $@"
                <h2>Welcome to Elegant Jewellery, {userName}!</h2>
                <p>Thank you for registering with us. We're excited to have you as part of our community.</p>
                <p>Start exploring our collection of exquisite jewellery pieces designed just for you.</p>
                <p>If you have any questions, feel free to contact our customer support.</p>
                <br>
                <p>Best regards,</p>
                <p>The Elegant Jewellery Team</p>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendOrderConfirmationAsync(string toEmail, string userName, int orderId, string orderStatus)
        {
            var subject = $"Order Confirmation - Order #{orderId}";
            var body = $@"
                <h2>Thank you for your order, {userName}!</h2>
                <p>Your order #{orderId} has been successfully placed and is currently {orderStatus}.</p>
                <p>We will process your order soon and keep you updated on its status.</p>
                <p>You can track your order status by logging into your account.</p>
                <br>
                <p>Best regards,</p>
                <p>The Elegant Jewellery Team</p>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendOrderStatusUpdateAsync(string toEmail, string userName, int orderId, string newStatus)
        {
            var subject = $"Order Status Update - Order #{orderId}";
            var body = $@"
                <h2>Hello {userName},</h2>
                <p>Your order #{orderId} status has been updated to: {newStatus}</p>
                <p>You can track your order status by logging into your account.</p>
                <br>
                <p>Best regards,</p>
                <p>The Elegant Jewellery Team</p>";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}

