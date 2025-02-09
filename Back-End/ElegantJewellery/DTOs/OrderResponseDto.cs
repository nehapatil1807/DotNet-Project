namespace ElegantJewellery.DTOs
{
    public class OrderResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItemResponseDto> Items { get; set; }
        public string UserName { get; set; }

        // Added Shipping Details
        public ShippingDetailsDto ShippingDetails { get; set; }

        // Added Payment Details
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
    }
}