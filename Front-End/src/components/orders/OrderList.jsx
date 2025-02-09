import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { formatPrice, formatDate } from '../../utils/formatters';
import Loading from '../common/Loading';
import './OrderList.css';
import { OrderItemImage } from '../common/ProductImage';

const ORDER_STATUSES = {
  'All': 'text-dark',
  'Pending': 'text-warning',
  'Processing': 'text-info',
  'Shipped': 'text-primary',
  'Delivered': 'text-success',
  'Cancelled': 'text-danger'
};

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Latest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'amount-desc', label: 'Amount: High to Low' },
  { value: 'amount-asc', label: 'Amount: Low to High' }
];

const OrderList = () => {
  const { orders, loading, fetchOrders } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'bi-clock';
      case 'Processing': return 'bi-gear';
      case 'Shipped': return 'bi-truck';
      case 'Delivered': return 'bi-check-circle';
      case 'Cancelled': return 'bi-x-circle';
      default: return 'bi-circle';
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(search) ||
        order.items.some(item => item.productName.toLowerCase().includes(search))
      );
    }

    // Apply timeframe filter
    const now = new Date();
    switch (timeframe) {
      case 'last30':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.orderDate);
          const diffTime = Math.abs(now - orderDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        });
        break;
      case 'last3months':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.orderDate);
          const diffTime = Math.abs(now - orderDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 90;
        });
        break;
      case 'last6months':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.orderDate);
          const diffTime = Math.abs(now - orderDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 180;
        });
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.orderDate) - new Date(b.orderDate);
        case 'date-desc':
          return new Date(b.orderDate) - new Date(a.orderDate);
        case 'amount-asc':
          return a.totalAmount - b.totalAmount;
        case 'amount-desc':
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });
  }, [orders, selectedStatus, sortBy, searchTerm, timeframe]);

  if (loading) return <Loading />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your Orders</h2>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {Object.keys(ORDER_STATUSES).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box display-1 text-muted mb-4"></i>
          <h3>No Orders Found</h3>
          <p className="text-muted mb-4">
            {searchTerm || selectedStatus !== 'All' 
              ? "Try adjusting your filters to see more orders"
              : "You haven't placed any orders yet"}
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredAndSortedOrders.map((order) => (
            <div key={order.id} className="col-12">
              <div className="card shadow-sm order-card">
                <div className="card-header bg-white py-3">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <small className="text-muted">Order ID</small>
                      <p className="mb-0 fw-bold">#{order.id}</p>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Order Date</small>
                      <p className="mb-0">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Total Amount</small>
                      <p className="mb-0 fw-bold">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <i className={`bi ${getStatusIcon(order.status)} me-2 ${ORDER_STATUSES[order.status]}`}></i>
                        <span className={ORDER_STATUSES[order.status]}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={item.id} className={`d-flex align-items-center ${
                            index !== order.items.length - 1 ? 'mb-3' : ''
                          }`}>
                            <OrderItemImage item={order.items[0]} />
                            <div>
                              <h6 className="mb-0">{item.productName}</h6>
                              <small className="text-muted">
                                Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-4 border-start">
                      <div className="shipping-info">
                        <h6 className="mb-2">Shipping Address</h6>
                        <p className="mb-1">{order.shippingDetails.fullName}</p>
                        <p className="mb-1">{order.shippingDetails.addressLine1}</p>
                        {order.shippingDetails.addressLine2 && (
                          <p className="mb-1">{order.shippingDetails.addressLine2}</p>
                        )}
                        <p className="mb-1">
                          {order.shippingDetails.city}, {order.shippingDetails.state}
                        </p>
                        <p className="mb-0">{order.shippingDetails.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-light text-dark me-2">
                        {order.paymentMethod}
                      </span>
                      <span className={`badge bg-${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="btn-group">
                      <Link 
                        to={`/order-tracking/${order.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Track Order
                      </Link>
                      <Link 
                        to={`/orders/${order.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;