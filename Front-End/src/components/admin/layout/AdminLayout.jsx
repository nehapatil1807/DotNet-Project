import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: 'bi-speedometer2', 
      label: 'Dashboard',
      description: 'Overview & Statistics'
    },
    { 
      path: '/admin/products', 
      icon: 'bi-box-seam', 
      label: 'Products',
      description: 'Manage Products'
    },
    { 
      path: '/admin/orders', 
      icon: 'bi-cart3', 
      label: 'Orders',
      description: 'Track & Manage Orders'
    },
    { 
      path: '/admin/categories', 
      icon: 'bi-collection', 
      label: 'Categories',
      description: 'Product Categories'
    },
    { 
      path: '/admin/customers', 
      icon: 'bi-people', 
      label: 'Customers',
      description: 'Customer Management'
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Toggle sidebar collapse state
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem : { label: 'Admin Panel', description: 'Dashboard & Analytics' };
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${showMobileMenu ? 'show' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="brand-logo">
            <img src="/logo192.jpeg" alt="Logo" />
            <span className="brand-text">Admin Panel</span>
          </Link>
          <button 
            className="toggle-btn"
            onClick={handleToggleSidebar}
          >
            <i className={`bi bi-chevron-${isSidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        {/* Admin Profile */}
        <div className="admin-profile">
          <div className="profile-info">
            <div className="avatar">
              {user?.firstName?.charAt(0)}
            </div>
            <div className="user-details">
              <h6 className="user-name">{user?.firstName} {user?.lastName}</h6>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          {menuItems.map((item) => (
            <div key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <i className={`bi ${item.icon} nav-icon`}></i>
                <span className="nav-text">{item.label}</span>
              </Link>
            </div>
          ))}

          <div className="nav-item">
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{ width: '100%', border: 'none', background: 'none' }}
            >
              <i className="bi bi-box-arrow-right nav-icon"></i>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Top Navigation */}
        <div className="top-nav">
          <div className="d-flex align-items-center gap-4">
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className="bi bi-list"></i>
            </button>
            <div>
              <h1 className="page-title">{getCurrentPageTitle().label}</h1>
              <p className="text-muted mb-0">{getCurrentPageTitle().description}</p>
            </div>
          </div>

          <div className="top-nav-actions">
            <button className="notification-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <div className="dropdown">
              <button
                className="btn btn-link text-dark dropdown-toggle d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown"
              >
                <div className="avatar">
                  {user?.firstName?.charAt(0)}
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/admin/profile">
                    <i className="bi bi-person me-2"></i>Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/settings">
                    <i className="bi bi-gear me-2"></i>Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {showMobileMenu && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;