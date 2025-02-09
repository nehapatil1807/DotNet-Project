import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { formatPrice, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import './OrderTracking.css';

const ORDER_STATUSES = {
  'Pending': {
    icon: 'bi-clock-history',
    color: 'warning',
    description: 'Your order has been placed and is awaiting confirmation'
  },
  'Processing': {
    icon: 'bi-gear',
    color: 'info',
    description: 'Your order is being processed and packed'
  },
  'Shipped': {
    icon: 'bi-truck',
    color: 'primary',
    description: 'Your order is on its way to you'
  },
  'Delivered': {
    icon: 'bi-check-circle',
    color: 'success',
    description: 'Your order has been delivered successfully'
  },
  'Cancelled': {
    icon: 'bi-x-circle',
    color: 'danger',
    description: 'Your order has been cancelled'
  }
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    // Set up polling for status updates
    const interval = setInterval(fetchOrderDetails, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setError(null);
      const result = await getOrder(id);
      if (result.success) {
        setOrder(result.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order details');
      toast.error('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return statusOrder.indexOf(status);
  };

  const getEstimatedDelivery = () => {
    if (!order?.orderDate) return null;
    
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // Estimate 5 days for delivery
    
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-circle text-danger display-1 mb-4"></i>
          <h3>{error}</h3>
          <p className="text-muted mb-4">We couldn't find the order you're looking for.</p>
          <Link to="/orders" className="btn btn-primary">View All Orders</Link>
        </div>
      </div>
    );
  }
  if (!order) return null;

  const currentStatus = ORDER_STATUSES[order.status];
  const statusIndex = getStatusIndex(order.status);
  const estimatedDelivery = getEstimatedDelivery();

  return (
    <div className="container py-4">
      {/* Order Status Banner */}
      <div className={`card border-${currentStatus.color} mb-4`}>
        <div className="card-body">
          <div className="d-flex align-items-center">
            <i className={`bi ${currentStatus.icon} fs-1 text-${currentStatus.color} me-3`}></i>
            <div>
              <h4 className="mb-1">Order {order.status}</h4>
              <p className="mb-0 text-muted">{currentStatus.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Order Progress */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Progress</h5>
              <div className="position-relative mb-5">
                <div className="progress" style={{ height: '2px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: `${(statusIndex / 3) * 100}%`,
                      backgroundColor: `var(--bs-${currentStatus.color})`
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between position-relative">
                  {Object.entries(ORDER_STATUSES).slice(0, 4).map(([status, info], index) => {
                    const isCompleted = index <= statusIndex;
                    const isCurrent = status === order.status;

                    return (
                      <div key={status} className="text-center" style={{ width: '120px' }}>
                        <div 
                          className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                            isCompleted ? `bg-${info.color}` : 'bg-light'
                          }`}
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            border: isCurrent ? `2px solid var(--bs-${info.color})` : 'none'
                          }}
                        >
                          <i className={`bi ${info.icon} ${isCompleted ? 'text-white' : 'text-muted'}`}></i>
                        </div>
                        <div className={isCompleted ? `text-${info.color}` : 'text-muted'}>
                          {status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery */}
              {order.status !== 'Cancelled' && (
                <div className="text-center">
                  <h6>Estimated Delivery</h6>
                  <p className="mb-0">{estimatedDelivery}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body p-0">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 border-bottom">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <img
                        src={item.imageUrl || '/placeholder.jpg'}
                        alt={item.productName}
                        className="rounded"
                        style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                    </div>
                    <div className="col">
                      <h6 className="mb-1">{item.productName}</h6>
                      <p className="mb-0 text-muted">
                        Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="col-auto">
                      <strong>{formatPrice(item.subtotal)}</strong>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-light">
                <div className="d-flex justify-content-between">
                  <strong>Total Amount</strong>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Order Details */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Details</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted d-block">Order ID</small>
                <strong>#{order.id}</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Order Date</small>
                <strong>{formatDate(order.orderDate)}</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Payment Method</small>
                <strong>{order.paymentMethod}</strong>
              </div>
              <div>
                <small className="text-muted d-block">Payment Status</small>
                <span className={`badge bg-${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Shipping Details</h5>
            </div>
            <div className="card-body">
              <p className="mb-1"><strong>{order.shippingDetails.fullName}</strong></p>
              <p className="mb-1">{order.shippingDetails.addressLine1}</p>
              {order.shippingDetails.addressLine2 && (
                <p className="mb-1">{order.shippingDetails.addressLine2}</p>
              )}
              <p className="mb-1">
                {order.shippingDetails.city}, {order.shippingDetails.state}
              </p>
              <p className="mb-1">{order.shippingDetails.pincode}</p>
              <p className="mb-0">Phone: {order.shippingDetails.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/orders')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Orders
        </button>
        {order.status === 'Delivered' && (
          <button className="btn btn-primary">
            <i className="bi bi-star me-2"></i>
            Rate Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;