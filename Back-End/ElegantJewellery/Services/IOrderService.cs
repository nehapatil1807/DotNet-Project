using ElegantJewellery.DTOs;
using ElegantJewellery.Models;

namespace ElegantJewellery.Services
{
    public interface IOrderService
    {
        Task<ApiResponse<OrderResponseDto>> CreateOrderFromCartAsync(int userId, OrderCreateDto orderCreateDto);
        Task<ApiResponse<OrderResponseDto>> GetOrderByIdAsync(int orderId, int userId);
        Task<ApiResponse<IEnumerable<OrderResponseDto>>> GetUserOrdersAsync(int userId);
        Task<ApiResponse<OrderResponseDto>> UpdateOrderStatusAsync(int orderId, OrderStatusUpdateDto statusDto);
        Task<ApiResponse<IEnumerable<OrderResponseDto>>> GetAllOrdersAsync();


    }
}
