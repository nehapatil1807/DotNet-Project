using System.ComponentModel.DataAnnotations;

namespace ElegantJewellery.DTOs
{
    public class ShippingDetailsDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        public string AddressLine1 { get; set; }

        public string AddressLine2 { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        public string State { get; set; }

        [Required]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Please enter a valid 6-digit pincode")]
        public string Pincode { get; set; }

        [Required]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Please enter a valid 10-digit phone number")]
        public string Phone { get; set; }
    }

    public class OrderCreateDto
    {
        [Required]
        public ShippingDetailsDto ShippingDetails { get; set; }

        [Required]
        public string PaymentMethod { get; set; }
    }
}