import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'COD', name: 'Cash on Delivery', icon: 'bi-cash' },
  { id: 'UPI', name: 'UPI', icon: 'bi-phone', disabled: true },
  { id: 'CARD', name: 'Credit/Debit Card', icon: 'bi-credit-card', disabled: true }
];

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: 'bi-truck' },
  { key: 'payment', label: 'Payment', icon: 'bi-credit-card' },
  { key: 'review', label: 'Review', icon: 'bi-list-check' },
  { key: 'confirmation', label: 'Confirmation', icon: 'bi-check-circle' }
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { createOrder } = useOrders();
  const [activeStep, setActiveStep] = useState('shipping');
  const [processing, setProcessing] = useState(false);
  const [pincodeLookup, setPincodeLookup] = useState({ loading: false, data: null });

  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const validatePincode = async (pincode) => {
    if (pincode.length === 6) {
      setPincodeLookup({ loading: true, data: null });
      try {
        // Simulated API call - replace with actual pincode validation API
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (['400001', '400002', '400003'].includes(pincode)) {
          setPincodeLookup({
            loading: false,
            data: {
              city: 'Mumbai',
              state: 'Maharashtra',
              serviceable: true
            }
          });
          setShippingDetails(prev => ({
            ...prev,
            city: 'Mumbai',
            state: 'Maharashtra'
          }));
          setErrors(prev => ({ ...prev, pincode: '' }));
        } else {
          setPincodeLookup({
            loading: false,
            data: { serviceable: false }
          });
          setErrors(prev => ({
            ...prev,
            pincode: 'Delivery not available at this pincode'
          }));
        }
      } catch (error) {
        setPincodeLookup({ loading: false, data: null });
        setErrors(prev => ({
          ...prev,
          pincode: 'Error validating pincode'
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Format phone number
      const cleaned = value.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{0,5})(\d{0,5})$/);
      const formatted = match ? match[1] + (match[2] ? '-' + match[2] : '') : cleaned;
      setShippingDetails(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'pincode') {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      setShippingDetails(prev => ({ ...prev, [name]: cleaned }));
      if (cleaned.length === 6) {
        validatePincode(cleaned);
      } else {
        setPincodeLookup({ loading: false, data: null });
      }
    } else {
      setShippingDetails(prev => ({ ...prev, [name]: value }));
    }

    // Validate field immediately after input
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors[name] = 'Full name is required';
        } else if (value.length < 3) {
          newErrors[name] = 'Name must be at least 3 characters';
        } else {
          delete newErrors[name];
        }
        break;

      case 'phone':
        if (!value) {
          newErrors[name] = 'Phone number is required';
        } else if (!/^\d{5}-\d{5}$/.test(value)) {
          newErrors[name] = 'Enter valid 10-digit phone number';
        } else {
          delete newErrors[name];
        }
        break;

      case 'addressLine1':
        if (!value.trim()) {
          newErrors[name] = 'Address is required';
        } else if (value.length < 10) {
          newErrors[name] = 'Please enter complete address';
        } else {
          delete newErrors[name];
        }
        break;

      case 'pincode':
        if (!value) {
          newErrors[name] = 'Pincode is required';
        } else if (!/^\d{6}$/.test(value)) {
          newErrors[name] = 'Enter valid 6-digit pincode';
        } else if (pincodeLookup.data?.serviceable === false) {
          newErrors[name] = 'Delivery not available at this pincode';
        } else {
          delete newErrors[name];
        }
        break;

      case 'city':
      case 'state':
        if (!value.trim()) {
          newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        } else {
          delete newErrors[name];
        }
        break;

      default:
        break;
    }

    // Set errors immediately
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    
    requiredFields.forEach(field => {
      const value = shippingDetails[field];
      if (!validateField(field, value)) {
        isValid = false;
      }
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    return isValid;
  };

  const handleStepSubmit = () => {
    switch (activeStep) {
      case 'shipping':
        if (validateForm()) {
          setActiveStep('payment');
        }
        break;
      case 'payment':
        setActiveStep('review');
        break;
      case 'review':
        handlePlaceOrder();
        break;
      default:
        break;
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      const orderData = {
        shippingDetails: {
          fullName: shippingDetails.fullName,
          addressLine1: shippingDetails.addressLine1,
          addressLine2: shippingDetails.addressLine2 || '',
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
          phone: shippingDetails.phone.replace(/-/g, '') // Remove hyphens from phone number
        },
        paymentMethod
      };

      const result = await createOrder(orderData);
      
      if (result.success) {
        await clearCart();
        setActiveStep('confirmation');
        setTimeout(() => {
          navigate(`/order-tracking/${result.order.id}`);
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Error placing order');
      console.error('Order error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'shipping':
        return (
          <div className="shipping-form">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`}
                  name="fullName"
                  value={shippingDetails.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                />
                {touched.fullName && errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  value={shippingDetails.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter 10-digit phone number"
                />
                {touched.phone && errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Address Line 1</label>
                <input
                  type="text"
                  className={`form-control ${touched.addressLine1 && errors.addressLine1 ? 'is-invalid' : ''}`}
                  name="addressLine1"
                  value={shippingDetails.addressLine1}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="House/Flat No., Building Name, Street"
                />
                {touched.addressLine1 && errors.addressLine1 && (
                  <div className="invalid-feedback">{errors.addressLine1}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  name="addressLine2"
                  value={shippingDetails.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Landmark, Area (optional)"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Pincode</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control ${touched.pincode && errors.pincode ? 'is-invalid' : ''}`}
                    name="pincode"
                    value={shippingDetails.pincode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="6-digit pincode"
                  />
                  {pincodeLookup.loading && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                  {touched.pincode && errors.pincode && (
                    <div className="invalid-feedback">{errors.pincode}</div>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className={`form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                  name="city"
                  value={shippingDetails.city}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter city"
                  readOnly={pincodeLookup.data?.city}
                />
                {touched.city && errors.city && (
                  <div className="invalid-feedback">{errors.city}</div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className={`form-control ${touched.state && errors.state ? 'is-invalid' : ''}`}
                  name="state"
                  value={shippingDetails.state}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter state"
                  readOnly={pincodeLookup.data?.state}
                />
                {touched.state && errors.state && (
                  <div className="invalid-feedback">{errors.state}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="payment-methods">
            {PAYMENT_METHODS.map(method => (
              <div 
                key={method.id}
                className={`payment-method-card ${method.disabled ? 'disabled' : ''} ${paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => !method.disabled && setPaymentMethod(method.id)}
              >
                <div className="d-flex align-items-center">
                  <i className={`bi ${method.icon} fs-4 me-3`}></i>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{method.name}</h6>
                    {method.disabled && (
                      <small className="text-muted" title="This payment method is currently unavailable">Coming soon</small>
                    )}
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={paymentMethod === method.id}
                      disabled={method.disabled}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'review':
        return (
          <div className="order-review">
            <div className="shipping-info mb-4">
              <h6 className="mb-3">Shipping Details</h6>
              <div className="card">
                <div className="card-body">
                  <div className="address-details">
                    <p className="mb-1">{shippingDetails.addressLine1}</p>
                    {shippingDetails.addressLine2 && (
                      <p className="mb-1">{shippingDetails.addressLine2}</p>
                    )}
                    <p className="mb-1">
                      {shippingDetails.city}, {shippingDetails.state} {shippingDetails.pincode}
                    </p>
                    <p className="mb-0">Phone: {shippingDetails.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-items mb-4">
              <h6 className="mb-3">Order Items</h6>
              <div className="card">
                <div className="card-body p-0">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="d-flex p-3 border-bottom">
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
                          Quantity: {item.quantity} × {formatPrice(item.productPrice)}
                        </p>
                      </div>
                      <div className="text-end">
                        <strong>{formatPrice(item.subtotal)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="payment-info mb-4">
              <h6 className="mb-3">Payment Method</h6>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <i className={`bi ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon} fs-4 me-3`}></i>
                    <div>
                      <h6 className="mb-0">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}</h6>
                      <small className="text-muted">Pay when you receive your order</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center py-5">
            <div className="success-animation">
              <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3 className="mt-4">Order Placed Successfully!</h3>
            <p className="text-muted">
              Thank you for your order. You'll receive an email confirmation shortly.
            </p>
            <p className="text-muted">
              We value your feedback! Please let us know how we did.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (cartLoading) return <Loading />;

  return (
    <div className="container py-4">
      {/* Checkout Steps */}
      <div className="checkout-steps mb-5">
        {STEPS.map((step, index) => {
          const stepIndex = STEPS.findIndex(s => s.key === activeStep);
          const isCompleted = index < stepIndex;
          const isCurrent = step.key === activeStep;

          return (
            <div key={step.key} className="checkout-step">
              <div 
                className={`step-indicator ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <i className={`bi ${step.icon}`}></i>
              </div>
              <div className="step-label">{step.label}</div>
              {index < STEPS.length - 1 && (
                <div className={`step-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              {renderStepContent()}
            </div>
          </div>

          {activeStep !== 'confirmation' && (
            <div className="d-flex justify-content-between">
              {activeStep !== 'shipping' ? (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    const currentIndex = STEPS.findIndex(s => s.key === activeStep);
                    setActiveStep(STEPS[currentIndex - 1].key);
                  }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </button>
              ) : (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/cart')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Cart
                </button>
              )}

              <button
                className="btn btn-primary"
                onClick={handleStepSubmit}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : activeStep === 'review' ? (
                  'Place Order'
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({cart?.items?.length} items)</span>
                <span>{formatPrice(cart?.totalAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-0">
                <strong>Total</strong>
                <strong>{formatPrice(cart?.totalAmount)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;