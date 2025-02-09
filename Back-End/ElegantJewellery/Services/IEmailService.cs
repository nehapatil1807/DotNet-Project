

namespace ElegantJewellery.Services

{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string toEmail, string userName);
        Task SendOrderConfirmationAsync(string toEmail, string userName, int orderId, string orderStatus);
        Task SendOrderStatusUpdateAsync(string toEmail, string userName, int orderId, string newStatus);
    }
}
