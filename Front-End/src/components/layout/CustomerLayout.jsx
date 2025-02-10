import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const CustomerLayout = ({ children }) => {
  const { user } = useAuth();

  // Don't show navbar and footer for admin users
  if (user?.role === 'Admin') {
    return <>{children}</>;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;