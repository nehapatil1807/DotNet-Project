import api from './api';

export const orderService = {
    // Create a new order from cart
    createOrder: async (orderData) => {
        try {
            console.log('Creating order with data:', orderData);
            const response = await api.post('/order/checkout', {
                shippingDetails: orderData.shippingDetails,
                paymentMethod: orderData.paymentMethod
            });
            console.log('Order creation response:', response);
            return response;
        } catch (error) {
            console.error('Order creation error:', error);
            throw error;
        }
    },

    // Get a specific order
    getOrder: async (orderId) => {
        try {
            const response = await api.get(`/order/${orderId}`);
            console.log('Get order response:', response);
            return response;
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    },

    // Get user's orders
    getUserOrders: async () => {
        try {
            const response = await api.get('/order');
            console.log('Get user orders response:', response);
            return response;
        } catch (error) {
            console.error('Get user orders error:', error);
            throw error;
        }
    },

    // Admin: Get all orders
    getAllOrders: async () => {
        try {
            const response = await api.get('/order/all');
            console.log('Get all orders response:', response);
            return response;
        } catch (error) {
            console.error('Get all orders error:', error);
            throw error;
        }
    },

    // Admin: Update order status
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/order/${orderId}/status`, {
                status: status
            });
            console.log('Update order status response:', response);
            return response;
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    }
};