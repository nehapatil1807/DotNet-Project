using System.ComponentModel.DataAnnotations;

namespace ElegantJewellery.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }

        // Shipping Details
        public string ShippingFullName { get; set; }
        public string ShippingAddressLine1 { get; set; }
        public string ShippingAddressLine2 { get; set; }
        public string ShippingCity { get; set; }
        public string ShippingState { get; set; }
        public string ShippingPincode { get; set; }
        public string ShippingPhone { get; set; }

        // Payment Details
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; } = "Pending";

        public virtual User User { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}