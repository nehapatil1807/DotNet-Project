import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { orderService } from '../../../services/orderService';
import { formatPrice, formatDate } from '../../../utils/formatters';
import './AdminOrders.css';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      if (response.success) {
        setOrders(response.data);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success('Order status updated successfully');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Orders Management</h2>
        <button 
          className="btn btn-primary"
          onClick={fetchOrders}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Orders
        </button>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <span>{order.shippingDetails.fullName}</span>
                        <small className="text-muted">{order.shippingDetails.phone}</small>
                      </div>
                    </td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm w-auto bg-${getStatusColor(order.status)}`}
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingOrderId === order.id}
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {updatingOrderId === order.id && (
                        <div className="spinner-border spinner-border-sm ms-2" role="status">
                          <span className="visually-hidden">Updating...</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details #{selectedOrder.id}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedOrder(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Shipping Details</h6>
                    <p className="mb-1">{selectedOrder.shippingDetails.fullName}</p>
                    <p className="mb-1">{selectedOrder.shippingDetails.addressLine1}</p>
                    {selectedOrder.shippingDetails.addressLine2 && (
                      <p className="mb-1">{selectedOrder.shippingDetails.addressLine2}</p>
                    )}
                    <p className="mb-1">
                      {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state}
                    </p>
                    <p className="mb-1">{selectedOrder.shippingDetails.pincode}</p>
                    <p className="mb-0">{selectedOrder.shippingDetails.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p className="mb-1">Status: {selectedOrder.status}</p>
                    <p className="mb-1">Order Date: {formatDate(selectedOrder.orderDate)}</p>
                    <p className="mb-1">Payment Method: {selectedOrder.paymentMethod}</p>
                    <p className="mb-0">Payment Status: {selectedOrder.paymentStatus}</p>
                  </div>
                </div>

                <h6>Order Items</h6>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>{formatPrice(item.unitPrice)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Total Amount:</strong></td>
                        <td><strong>{formatPrice(selectedOrder.totalAmount)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedOrder(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;