import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/products', icon: 'bi-box-seam', label: 'Products' },
    { path: '/admin/orders', icon: 'bi-cart3', label: 'Orders' },
    { path: '/admin/categories', icon: 'bi-collection', label: 'Categories' },
    { path: '/admin/customers', icon: 'bi-people', label: 'Customers' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex h-100">
      {/* Sidebar */}
      <div className={`bg-dark text-white ${isSidebarCollapsed ? 'w-auto' : 'w-280px'} 
           min-h-screen transition-width duration-300 shadow`}>
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          {!isSidebarCollapsed && (
            <Link to="/admin/dashboard" className="text-decoration-none">
              <h5 className="text-white mb-0">Admin Panel</h5>
            </Link>
          )}
          <button
            className="btn btn-link text-white p-0"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          >
            <i className={`bi bi-chevron-${isSidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-3 border-bottom border-secondary">
          {!isSidebarCollapsed ? (
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center 
                   justify-content-center" style={{ width: '40px', height: '40px' }}>
                {user?.firstName?.charAt(0)}
              </div>
              <div className="ms-3">
                <h6 className="mb-0">{user?.firstName} {user?.lastName}</h6>
                <small className="text-muted">{user?.email}</small>
              </div>
            </div>
          ) : (
            <div className="d-flex justify-content-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center 
                   justify-content-center" style={{ width: '40px', height: '40px' }}>
                {user?.firstName?.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="nav flex-column mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link py-3 px-3 d-flex align-items-center ${
                location.pathname === item.path ? 'active bg-primary' : 'text-white'
              }`}
            >
              <i className={`bi ${item.icon} ${isSidebarCollapsed ? 'fs-5' : ''}`}></i>
              {!isSidebarCollapsed && <span className="ms-3">{item.label}</span>}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="nav-link py-3 px-3 text-danger border-0 bg-transparent d-flex align-items-center"
          >
            <i className={`bi bi-box-arrow-right ${isSidebarCollapsed ? 'fs-5' : ''}`}></i>
            {!isSidebarCollapsed && <span className="ms-3">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container-fluid">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/admin/dashboard">Admin</Link>
              </li>
              <li className="breadcrumb-item active">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </li>
            </ol>

            <div className="d-flex align-items-center">
              <div className="dropdown">
                <button
                  className="btn btn-link text-dark dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center 
                       justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                    {user?.firstName?.charAt(0)}
                  </div>
                  <span className="me-2">{user?.firstName} {user?.lastName}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link to="/admin/profile" className="dropdown-item">
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/settings" className="dropdown-item">
                      <i className="bi bi-gear me-2"></i>Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;