import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

export const PROTECTED_ROUTES = {
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/products',
    '/admin/orders',
    '/admin/categories',
    '/admin/customers'
  ],
  customer: [
    '/',  
    '/products',  
    '/cart',
    '/checkout',
    '/orders',
    '/profile',
    '/order-tracking'
  ]
};

export const RouteGuard = ({ path, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // If not logged in and trying to access protected route
  if (!user && (PROTECTED_ROUTES.admin.some(route => path.startsWith(route)) || 
                PROTECTED_ROUTES.customer.some(route => path.startsWith(route)))) {
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  // If admin trying to access customer routes
  if (user?.role === 'Admin' && PROTECTED_ROUTES.customer.some(route => path.startsWith(route))) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If customer trying to access admin routes
  if (user?.role === 'User' && PROTECTED_ROUTES.admin.some(route => path.startsWith(route))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user || user.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};