using ElegantJewellery.DTOs;
using ElegantJewellery.Models;

namespace ElegantJewellery.Services
{
    public interface ICartService
    {
        Task<ApiResponse<CartResponseDto>> GetCartByUserIdAsync(int userId);
        Task<ApiResponse<CartItemResponseDto>> AddItemToCartAsync(int userId, CartItemDto cartItemDto);
        Task<ApiResponse<CartItemResponseDto>> UpdateCartItemQuantityAsync(int userId, int productId, UpdateCartItemDto updateDto);
        Task<ApiResponse<bool>> RemoveItemFromCartAsync(int userId, int productId);
        Task<ApiResponse<bool>> ClearCartAsync(int userId);
    }
}
