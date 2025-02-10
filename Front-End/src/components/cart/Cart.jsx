import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';
import { CartItemImage } from '../common/ProductImage';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();
  const [processingItems, setProcessingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const [bounce, setBounce] = useState(false);

  // Calculate estimated delivery date (3-5 business days)
  const getEstimatedDelivery = () => {
    const today = new Date();
    const minDays = new Date(today.setDate(today.getDate() + 3));
    const maxDays = new Date(today.setDate(today.getDate() + 2));
    
    return {
      min: minDays.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      }),
      max: maxDays.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const handleQuantityUpdate = async (productId, newQuantity, currentQuantity) => {
    if (newQuantity === currentQuantity) return;
    
    try {
      setProcessingItems(prev => new Set(prev).add(productId));
      const result = await updateQuantity(productId, newQuantity);
      if (!result.success) {
        toast.error(result.message || 'Failed to update quantity');
      }
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      const result = await removeFromCart(productId);
      if (result.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) return <Loading />;

  if (!cart?.items?.length) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-cart3 display-1 text-muted mb-4"></i>
          <h2 className="mb-4">Your Cart is Empty</h2>
          <p className="text-muted mb-4">
            Looks like you haven't added anything to your cart yet.
            <br />
            Browse our collection and find something you'll love!
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const delivery = getEstimatedDelivery();

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Shopping Cart ({cart.items.length} items)</h5>
                <Link to="/products" className="btn btn-link text-decoration-none" style={{ color: '#212529'}}>
                  Continue Shopping
                </Link>
              </div>
            </div>
            <div className="card-body">
              {cart.items.map((item) => (
                <div key={item.id} className="cart-item mb-4 pb-4 border-bottom">
                  <div className="row align-items-center">
                    <div className="col-md-2 mb-3 mb-md-0">
                    <img
    src={item.imageUrl || '/placeholder.jpg'}
    alt={item.productName}
    className="rounded me-3"
    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
    onError={(e) => { e.target.src = '/placeholder.jpg' }}
/>
                      <Link to={`/products/${item.productId}`}>

                      </Link>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <Link 
                        to={`/products/${item.productId}`}
                        className="text-decoration-none text-dark"
                      >
                        <h6 className="mb-1">{item.productName}</h6>
                      </Link>
                      <p className="text-muted small mb-0">
                        Category: {item.categoryName}
                      </p>
                      <p className="text-primary mb-0">
                        {formatPrice(item.productPrice)}
                      </p>
                    </div>
                    <div className="col-md-3 mb-3 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="input-group input-group-sm" style={{ width: '120px' }}>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => handleQuantityUpdate(
                              item.productId, 
                              item.quantity - 1,
                              item.quantity
                            )}
                            disabled={
                              item.quantity <= 1 || 
                              processingItems.has(item.productId)
                            }
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            value={item.quantity}
                            readOnly
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => handleQuantityUpdate(
                              item.productId, 
                              item.quantity + 1,
                              item.quantity
                            )}
                            disabled={
                              item.quantity >= item.availableStock ||
                              processingItems.has(item.productId)
                            }
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        {processingItems.has(item.productId) && (
                          <div className="spinner-border spinner-border-sm ms-2" role="status">
                            <span className="visually-hidden">Updating...</span>
                          </div>
                        )}
                      </div>
                      {item.quantity >= item.availableStock && (
                        <small className="text-danger d-block mt-1">
                          Max stock reached
                        </small>
                      )}
                    </div>
                    <div className="col-md-2 mb-3 mb-md-0 text-md-end">
                      <div className="fw-bold mb-1">
                        {formatPrice(item.subtotal)}
                      </div>
                      <button 
                        className="btn btn-link btn-sm text-danger p-0"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={removingItems.has(item.productId)}
                      >
                        {removingItems.has(item.productId) ? (
                          <span className="spinner-border spinner-border-sm" role="status" />
                        ) : (
                          <i className="bi bi-trash me-1"></i>
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              {cart.totalAmount < 1000 && (
                <div className="alert alert-info small mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Add {formatPrice(1000 - cart.totalAmount)} more to get free shipping
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong>{formatPrice(cart.totalAmount)}</strong>
              </div>
              <button 
                className="btn btn-primary w-100 mb-3"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
              <div className="text-center">
                <i className="bi bi-shield-check text-success me-2"></i>
                <small className="text-muted">Secure Checkout</small>
              </div>
            </div>
          </div>

          {/* Delivery Estimate */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="bi bi-truck me-2"></i>
                Estimated Delivery
              </h6>
              <p className="mb-0">
                {delivery.min} - {delivery.max}
              </p>
              <small className="text-muted">
                Standard Delivery (3-5 business days)
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;