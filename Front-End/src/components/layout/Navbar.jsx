import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch products for suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productService.getAllProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle clicks outside of search suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      if (!location.pathname.includes('/products')) {
        setSearchTerm('');
      }
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}`);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (location.pathname.includes('/products')) {
      navigate('/products');
    }
  };

  return (
    <nav className="sticky-top shadow-sm bg-white">
      {/* Top bar with contact info */}
      <div className="bg-primary text-white py-2">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <span className="text-sm">
                <i className="bi bi-telephone me-2"></i>
                +91 98765 43210
              </span>
              <span className="text-sm">
                <i className="bi bi-envelope me-2"></i>
                info@elegantjewellery.com
              </span>
            </div>
            <div className="d-flex gap-3">
              <a href="#" className="text-white">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="py-3 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            {/* Logo */}
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <img 
                src="/logo192.jpeg" 
                alt="Elegant Jewellery" 
                className="rounded"
                style={{ height: '40px', width: 'auto' }}
              />
              <span className="ms-2 text-primary h4 mb-0 d-none d-md-block">
                Elegant Jewellery
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-grow-1 mx-4 d-none d-md-block position-relative" ref={searchRef}>
              <form className="w-100 position-relative" onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-end-0 bg-light"
                    placeholder="Search for jewellery..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(Boolean(searchTerm && suggestions.length))}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-0 bg-light"
                      onClick={handleClearSearch}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-outline-secondary border-start-0 bg-light"
                  >
                    <i className="bi bi-search text-primary"></i>
                  </button>
                </div>

                {loadingProducts && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </form>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="position-absolute w-100 mt-2 bg-white rounded shadow-lg border p-2 z-3">
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      className="d-flex align-items-center p-2 cursor-pointer hover-bg-light rounded"
                      onClick={() => handleSuggestionClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="rounded me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-medium">{product.name}</div>
                        <div className="small text-muted">{product.categoryName}</div>
                      </div>
                      <div className="text-primary fw-medium">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links and Cart */}
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="text-decoration-none text-dark">
                <i className="bi bi-house"></i>
              </Link>
              
              <Link to="/products" className="text-decoration-none text-dark">
                <i className="bi bi-gem"></i>
              </Link>

              {!user?.role?.includes('Admin') && (
                <Link to="/cart" className="position-relative text-decoration-none text-dark">
                  <i className="bi bi-cart3 fs-5"></i>
                  {cart?.totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      {user.firstName?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    {user.role === 'Admin' ? (
                      <>
                        <li><Link className="dropdown-item" to="/admin/dashboard">Dashboard</Link></li>
                        <li><Link className="dropdown-item" to="/admin/products">Products</Link></li>
                        <li><Link className="dropdown-item" to="/admin/orders">Orders</Link></li>
                      </>
                    ) : (
                      <>
                        <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                        <li><Link className="dropdown-item" to="/orders">Orders</Link></li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout} disabled={loading}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        {loading ? 'Logging out...' : 'Logout'}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="btn btn-primary rounded-pill px-4"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="d-md-none px-3 pb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control border-end-0 bg-light"
            placeholder="Search for jewellery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn btn-outline-secondary border-0 bg-light"
              onClick={handleClearSearch}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
          <button 
            className="btn btn-outline-secondary border-start-0 bg-light"
            onClick={handleSearch}
          >
            <i className="bi bi-search text-primary"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;