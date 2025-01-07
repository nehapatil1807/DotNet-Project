using ElegantJewellery.DTOs;
using ElegantJewellery.Models;

namespace ElegantJewellery.Services
{
    public interface IProductService
    {
        Task<ApiResponse<IEnumerable<ProductResponseDto>>> GetAllProductsAsync();
        Task<ApiResponse<ProductResponseDto>> GetProductByIdAsync(int id);
        Task<ApiResponse<ProductResponseDto>> CreateProductAsync(ProductDto productDto);
        Task<ApiResponse<ProductResponseDto>> UpdateProductAsync(int id, ProductDto productDto);
        Task<ApiResponse<bool>> DeleteProductAsync(int id);
        Task<ApiResponse<IEnumerable<ProductResponseDto>>> GetProductsByCategoryAsync(int categoryId);
        Task<ApiResponse<bool>> UpdateStockAsync(int id, int quantity);
    }
}
