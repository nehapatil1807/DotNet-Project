import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import './Navbar.css';

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
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="/logo192.jpeg" alt="Logo" className="navbar-logo" />
        </Link>

        <div className="d-flex flex-grow-1 mx-lg-5">
          <div className="w-100 position-relative" ref={searchRef}>
            <form className="w-100 position-relative" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input rounded-pill"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(Boolean(searchTerm && suggestions.length))}
                aria-label="Search products"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
              <button 
                type="submit" 
                className="search-button"
                aria-label="Submit search"
              >
                <i className="bi bi-search"></i>
              </button>
              {loadingProducts && <div className="search-loading"><i className="bi bi-arrow-clockwise"></i></div>}
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="suggestion-image"
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                      <div className="suggestion-details">
                        <div className="suggestion-name">{product.name}</div>
                        <div className="suggestion-category">{product.categoryName}</div>
                        <div className="suggestion-price">{formatPrice(product.price)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center">
        <div className="d-flex align-items-center">
  <Link to="/" className="nav-link me-4">
    <i className="bi bi-house"></i>
  </Link>
  <Link to="/products" className="nav-link me-4">
    <i className="bi bi-gem"></i>
  </Link>
  <Link to="/contact" className="nav-link me-4">
    <i className="bi bi-envelope"></i>
  </Link>
</div>

          {!user?.role?.includes('Admin') && (
            <Link to="/cart" className="nav-link me-4 position-relative">
              <i className="bi bi-cart3 fs-5"></i>
              {cart?.totalItems > 0 && (
                <span className="cart-badge">{cart.totalItems}</span>
              )}
            </Link>
          )}

          {user ? (
            <div className="dropdown">
              <button
                className="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center user-avatar-hover"
                type="button"
                id="userMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="user-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="User  Avatar" className="avatar-image" />
                  ) : (
                    user.firstName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu" role="menu">
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
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout} 
                    disabled={loading}
                  >
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="login-button text-decoration-none">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;