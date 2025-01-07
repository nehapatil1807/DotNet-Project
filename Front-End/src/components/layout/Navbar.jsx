import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Carousel from './Carousel';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const showCarousel = location.pathname === '/products' && !isAdmin;

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply theme classes to the body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('bg-dark', 'text-light');
    } else {
      document.body.classList.remove('bg-dark', 'text-light');
    }
  }, [isDarkMode]);

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg ${
          isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
        }`}
      >
        <div className="container">
          <a href='/'><img src="./logo192.jpeg" alt="logo" width="70" height="70" /></a>
          
          <Link className="navbar-brand" to={isAdmin ? "/admin/dashboard" : "/"}>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              {isAdmin ? (
                <>
                  <li className="nav-item">
                    
                    <Link className="nav-link" to="/admin/products">
                      <b>Manage Products</b>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/orders">
                      <b>Manage Orders</b>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">

                    <Link className="nav-link" to="/products">
                     <b>Products</b> 
                    </Link>
                  </li>
                  {user && (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link" to="/cart">
                         <b>Cart</b> {' '}
                          {cart && cart.totalItems > 0 && (
                            <span className="badge bg-primary">{cart.totalItems}</span>
                          )}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/orders">
                          <b>Orders</b>
                        </Link>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              {user ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    {user.firstName} {user.lastName}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <b>Logout</b>
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">
                      <b>Login</b>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">
                      <b>Register</b>
                    </Link>
                  </li>
                </>
              )}
            </ul>
            {/* Day/Night Mode Toggle Button */}
            <button
              className={`btn ms-3 ${isDarkMode ? 'btn-light' : 'btn-dark'}`}
              onClick={toggleDarkMode}
            >
              {isDarkMode ? 'Light 🌞' : 'Dark 🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Render the Carousel only on the Products page */}
      {showCarousel && <Carousel />}
    </>
  );
};

export default Navbar;
