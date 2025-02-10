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

  if (loading) return <Loading />;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-body">
          {/* Order Tracking Number */}
          <div className="mb-4">
            <p className="text-muted mb-1">Order Tracking Number</p>
            <div className="h5 text-primary">#{order.id}</div>
          </div>

          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">Order Items</h5>
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

              {/* Summary: Shipping Details & Order Summary */}
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
            <Link to="/orders" className="btn btn-outline-secondary">
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