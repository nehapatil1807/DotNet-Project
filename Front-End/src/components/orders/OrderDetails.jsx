import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { formatPrice } from '../../utils/formatters';
import Loading from '../common/Loading';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await getOrder(id);
      if (result.success) {
        setOrder(result.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderSteps = [
    { status: 'PLACED', label: 'Placed' },
    { status: 'CONFIRMED', label: 'Confirmed' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' }
  ];

  const getCurrentStepIndex = () => {
    return orderSteps.findIndex(step => step.status === order?.status) || 0;
  };

  if (loading) return <Loading />;
  if (!order) return <div>Order not found</div>;

  const currentStep = getCurrentStepIndex();

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-body">
          <div className="text-primary mb-2">ORDER CONFIRMED SUCCESSFULLY</div>
          <h2 className="mb-3">Track Your Order</h2>
          <p className="text-muted mb-4">
            We appreciate your order, we're currently processing it. So hang tight and we'll send you confirmation very soon!
          </p>

          {/* Tracking Number */}
          <div className="mb-4">
            <p className="text-muted mb-1">Tracking number</p>
            <div className="h5 text-primary">#{order.id}</div>
          </div>

          {/* Order Progress */}
          <div className="position-relative mb-5">
            <div className="progress" style={{ height: '2px' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
              />
            </div>

            <div className="d-flex justify-content-between position-relative">
              {orderSteps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.status} className="text-center" style={{ width: '120px', marginTop: '-10px' }}>
                    <div 
                      className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                        isCompleted ? 'bg-primary' : 'bg-light'
                      }`}
                      style={{ 
                        width: '24px', 
                        height: '24px',
                        border: isCurrent ? '2px solid #0d6efd' : 'none'
                      }}
                    >
                      {isCompleted ? (
                        <i className="bi bi-check text-white small"></i>
                      ) : (
                        <span className={`small ${isCurrent ? 'text-primary' : 'text-muted'}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className={isCompleted ? 'text-primary' : 'text-muted'}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-body">
              {order.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center mb-3">
                  <img
                    src={item.imageUrl || '/placeholder.jpg'}
                    alt={item.productName}
                    className="me-3 rounded"
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/placeholder.jpg' }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.productName}</h6>
                    <p className="mb-0 text-muted">
                      Size: {item.size || 'N/A'} | Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="h6 mb-0">{formatPrice(item.subtotal)}</div>
                  </div>
                </div>
              ))}

              <hr />

              {/* Order Summary */}
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-2">Shipping Details</h6>
                  <p className="mb-1">{order.shippingDetails?.fullName}</p>
                  <p className="mb-1">{order.shippingDetails?.addressLine1}</p>
                  {order.shippingDetails?.addressLine2 && (
                    <p className="mb-1">{order.shippingDetails.addressLine2}</p>
                  )}
                  <p className="mb-1">
                    {order.shippingDetails?.city}, {order.shippingDetails?.state}
                  </p>
                  <p className="mb-1">{order.shippingDetails?.pincode}</p>
                  <p className="mb-0">{order.shippingDetails?.phone}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-2">Order Summary</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total</strong>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <Link to="/orders" className="btn btn-outline-primary">
              Back to Orders
            </Link>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;