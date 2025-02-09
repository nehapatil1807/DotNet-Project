import React, { createContext, useContext, useState } from 'react';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      console.log('Creating order with data:', orderData);
      const response = await orderService.createOrder(orderData);
      console.log('Order creation response:', response);

      if (response.success) {
        // Add the new order to the orders list
        setOrders(prev => [response.data, ...prev]);
        return { 
          success: true, 
          order: response.data,
          message: 'Order created successfully'
        };
      }
      return { 
        success: false, 
        message: response.message || 'Failed to create order'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return { 
        success: false, 
        message: error.message || 'Error creating order'
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      console.log('Fetched orders:', response);
      
      if (response.success) {
        setOrders(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId) => {
    try {
      console.log('Fetching order:', orderId);
      const response = await orderService.getOrder(orderId);
      console.log('Order details response:', response);
      
      if (response.success) {
        return { success: true, order: response.data };
      }
      return { 
        success: false, 
        message: response.message || 'Order not found'
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { 
        success: false, 
        message: error.message || 'Error fetching order details'
      };
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        createOrder,
        fetchOrders,
        getOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;