import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
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
    <div className="admin-orders">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 filters-bar">
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
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="customer-info">
                <div className="info-group">
                  <h6>Shipping Details</h6>
                  <p>{selectedOrder.shippingDetails.fullName}</p>
                  <p>{selectedOrder.shippingDetails.addressLine1}</p>
                  {selectedOrder.shippingDetails.addressLine2 && (
                    <p>{selectedOrder.shippingDetails.addressLine2}</p>
                  )}
                  <p>{selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state}</p>
                  <p>{selectedOrder.shippingDetails.pincode}</p>
                  <p>{selectedOrder.shippingDetails.phone}</p>
                </div>
                <div className="info-group">
                  <h6>Order Information</h6>
                  <p>Status: {selectedOrder.status}</p>
                  <p>Order Date: {formatDate(selectedOrder.orderDate)}</p>
                  <p>Payment Method: {selectedOrder.paymentMethod}</p>
                  <p>Payment Status: {selectedOrder.paymentStatus}</p>
                </div>
              </div>

              <h6>Order Items</h6>
              <div className="order-items">
                {selectedOrder.items.map((item) => (
                  <div className="item-row" key={item.id}>
                    <div className="item-image">
                      <img src={item.productImage} alt={item.productName} />
                    </div>
                    <div className="item-details">
                      <h6>{item.productName}</h6>
                      <p className="item-meta">Price: {formatPrice(item.unitPrice)}</p>
                      <p className="item-meta">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">{formatPrice(item.subtotal)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrders;