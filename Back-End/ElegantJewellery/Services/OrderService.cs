using AutoMapper;
using ElegantJewellery.DTOs;
using ElegantJewellery.Models;
using ElegantJewellery.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ElegantJewellery.Services
{
    public class OrderService : IOrderService
    {
        private readonly IGenericRepository<Order> _orderRepository;
        private readonly IGenericRepository<OrderItem> _orderItemRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly ICartService _cartService;
        private readonly IProductService _productService;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;

        public OrderService(
            IGenericRepository<Order> orderRepository,
            IGenericRepository<OrderItem> orderItemRepository,
            IGenericRepository<User> userRepository,
            ICartService cartService,
            IProductService productService,
            IEmailService emailService,
            IMapper mapper)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _userRepository = userRepository;
            _cartService = cartService;
            _productService = productService;
            _emailService = emailService;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<OrderResponseDto>>> GetAllOrdersAsync()
        {
            try
            {
                var orders = await _orderRepository.GetAllWithIncludesAsync(
                    o => true,
                    "OrderItems",
                    "OrderItems.Product",
                    "User"
                );

                var orderResponses = await Task.WhenAll(
                    orders.Select(async o => await CreateOrderResponseDto(o))
                );

                return ApiResponse<IEnumerable<OrderResponseDto>>.SuccessResponse(orderResponses);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<OrderResponseDto>>.ErrorResponse(
                    "Error retrieving orders",
                    new List<string> { ex.Message }
                );
            }
        }

        public async Task<ApiResponse<OrderResponseDto>> CreateOrderFromCartAsync(int userId, OrderCreateDto orderCreateDto)
        {
            try
            {
                var cartResponse = await _cartService.GetCartByUserIdAsync(userId);
                if (!cartResponse.Success || cartResponse.Data?.Items == null || !cartResponse.Data.Items.Any())
                {
                    return ApiResponse<OrderResponseDto>.ErrorResponse("Cart is empty");
                }

                // Begin transaction
                decimal totalAmount = 0;
                var orderItems = new List<OrderItem>();

                foreach (var cartItem in cartResponse.Data.Items)
                {
                    var productResponse = await _productService.GetProductByIdAsync(cartItem.ProductId);
                    if (!productResponse.Success)
                    {
                        return ApiResponse<OrderResponseDto>.ErrorResponse(
                            $"Product not found: {cartItem.ProductId}"
                        );
                    }

                    if (productResponse.Data.Stock < cartItem.Quantity)
                    {
                        return ApiResponse<OrderResponseDto>.ErrorResponse(
                            $"Insufficient stock for product: {productResponse.Data.Name}",
                            new List<string> { $"Only {productResponse.Data.Stock} items available" }
                        );
                    }

                    var itemTotal = productResponse.Data.Price * cartItem.Quantity;
                    totalAmount += itemTotal;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = cartItem.ProductId,
                        Quantity = cartItem.Quantity,
                        Price = productResponse.Data.Price
                    });

                    // Update product stock
                    await _productService.UpdateStockAsync(cartItem.ProductId, -cartItem.Quantity);
                }

                var shipping = orderCreateDto.ShippingDetails;
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    TotalAmount = totalAmount,
                    ShippingFullName = shipping.FullName,
                    ShippingAddressLine1 = shipping.AddressLine1,
                    ShippingAddressLine2 = shipping.AddressLine2,
                    ShippingCity = shipping.City,
                    ShippingState = shipping.State,
                    ShippingPincode = shipping.Pincode,
                    ShippingPhone = shipping.Phone,
                    PaymentMethod = orderCreateDto.PaymentMethod,
                    PaymentStatus = "Pending"
                };

                var createdOrder = await _orderRepository.AddAsync(order);

                foreach (var item in orderItems)
                {
                    item.OrderId = createdOrder.Id;
                    await _orderItemRepository.AddAsync(item);
                }

                // Clear the cart after successful order creation
                await _cartService.ClearCartAsync(userId);

                // Get user details and send confirmation email
                var user = await _userRepository.GetByIdAsync(userId);
                if (user != null)
                {
                    await _emailService.SendOrderConfirmationAsync(
                        user.Email,
                        $"{user.FirstName} {user.LastName}",
                        createdOrder.Id,
                        createdOrder.Status
                    );
                }

                // Get complete order with items
                var completeOrder = await GetOrderByIdWithItemsAsync(createdOrder.Id);
                var orderResponse = await CreateOrderResponseDto(completeOrder);

                return ApiResponse<OrderResponseDto>.SuccessResponse(
                    orderResponse,
                    "Order created successfully"
                );
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderResponseDto>.ErrorResponse(
                    "Error creating order",
                    new List<string> { ex.Message }
                );
            }
        }

        public async Task<ApiResponse<OrderResponseDto>> GetOrderByIdAsync(int orderId, int userId)
        {
            try
            {
                var order = await GetOrderByIdWithItemsAsync(orderId);
                if (order == null || (order.UserId != userId && !await IsAdminUser(userId)))
                {
                    return ApiResponse<OrderResponseDto>.ErrorResponse("Order not found");
                }

                var orderResponse = await CreateOrderResponseDto(order);
                return ApiResponse<OrderResponseDto>.SuccessResponse(orderResponse);
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderResponseDto>.ErrorResponse(
                    "Error retrieving order",
                    new List<string> { ex.Message }
                );
            }
        }

        public async Task<ApiResponse<IEnumerable<OrderResponseDto>>> GetUserOrdersAsync(int userId)
        {
            try
            {
                var orders = await _orderRepository.GetAllWithIncludesAsync(
                    o => o.UserId == userId,
                    "OrderItems",
                    "OrderItems.Product",
                    "User"
                );

                var orderResponses = await Task.WhenAll(
                    orders.Select(async o => await CreateOrderResponseDto(o))
                );

                return ApiResponse<IEnumerable<OrderResponseDto>>.SuccessResponse(orderResponses);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<OrderResponseDto>>.ErrorResponse(
                    "Error retrieving orders",
                    new List<string> { ex.Message }
                );
            }
        }

        public async Task<ApiResponse<OrderResponseDto>> UpdateOrderStatusAsync(
            int orderId,
            OrderStatusUpdateDto statusDto)
        {
            try
            {
                if (!OrderStatus.ValidStatuses.Contains(statusDto.Status))
                {
                    return ApiResponse<OrderResponseDto>.ErrorResponse(
                        "Invalid order status",
                        new List<string> { $"Valid statuses are: {string.Join(", ", OrderStatus.ValidStatuses)}" }
                    );
                }

                var order = await GetOrderByIdWithItemsAsync(orderId);
                if (order == null)
                {
                    return ApiResponse<OrderResponseDto>.ErrorResponse("Order not found");
                }

                var oldStatus = order.Status;
                order.Status = statusDto.Status;
                await _orderRepository.UpdateAsync(order);

                // Send email notification if status changed
                if (oldStatus != statusDto.Status)
                {
                    var user = await _userRepository.GetByIdAsync(order.UserId);
                    if (user != null)
                    {
                        await _emailService.SendOrderStatusUpdateAsync(
                            user.Email,
                            $"{user.FirstName} {user.LastName}",
                            order.Id,
                            statusDto.Status
                        );
                    }
                }

                var orderResponse = await CreateOrderResponseDto(order);
                return ApiResponse<OrderResponseDto>.SuccessResponse(
                    orderResponse,
                    "Order status updated successfully"
                );
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderResponseDto>.ErrorResponse(
                    "Error updating order status",
                    new List<string> { ex.Message }
                );
            }
        }

        private async Task<Order> GetOrderByIdWithItemsAsync(int orderId)
        {
            var orders = await _orderRepository.GetAllWithIncludesAsync(
                o => o.Id == orderId,
                "OrderItems",
                "OrderItems.Product",
                "User"
            );
            return orders.FirstOrDefault();
        }

        private async Task<OrderResponseDto> CreateOrderResponseDto(Order order)
        {
            var orderItems = order.OrderItems?.Select(item => new OrderItemResponseDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name ?? "Unknown Product",
                ImageUrl = item.Product?.ImageUrl,
                Quantity = item.Quantity,
                UnitPrice = item.Price,
                Subtotal = item.Price * item.Quantity
            }).ToList() ?? new List<OrderItemResponseDto>();

            var userFullName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}" : "Unknown";

            return new OrderResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Items = orderItems,
                UserName = userFullName,
                ShippingDetails = new ShippingDetailsDto
                {
                    FullName = order.ShippingFullName,
                    AddressLine1 = order.ShippingAddressLine1,
                    AddressLine2 = order.ShippingAddressLine2,
                    City = order.ShippingCity,
                    State = order.ShippingState,
                    Pincode = order.ShippingPincode,
                    Phone = order.ShippingPhone
                },
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus
            };
        }

        private async Task<bool> IsAdminUser(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user?.Role == "Admin";
        }
    }
}