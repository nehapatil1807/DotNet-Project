// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Admin Components
import AdminLayout from './components/admin/layout/AdminLayout';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import AdminProducts from './components/admin/products/AdminProducts';
import AdminOrders from './components/admin/orders/AdminOrders';

// Customer Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/home/Homepage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import OrderList from './components/orders/OrderList';
import OrderDetails from './components/orders/OrderDetails';
import OrderTracking from './components/orders/OrderTracking';
import Loading from './components/common/Loading';

// Styles
import './styles/HomePage.css';
import './styles/ProductCard.css';
import './styles/admin.css';
import './styles/theme.css';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};

const CustomerLayout = ({ children }) => {
  const { user } = useAuth();
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

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <Routes>
              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                }
              />

              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <CustomerLayout>
                      <Login />
                    </CustomerLayout>
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <CustomerLayout>
                      <Register />
                    </CustomerLayout>
                  </GuestRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/"
                element={
                  <CustomerLayout>
                    <HomePage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <CustomerLayout>
                    <ProductList />
                  </CustomerLayout>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <CustomerLayout>
                    <ProductDetails />
                  </CustomerLayout>
                }
              />

              {/* Protected Customer Routes */}
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <CustomerLayout>
                      <Cart />
                    </CustomerLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <CustomerLayout>
                      <Checkout />
                    </CustomerLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <CustomerLayout>
                      <OrderList />
                    </CustomerLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <PrivateRoute>
                    <CustomerLayout>
                      <OrderDetails />
                    </CustomerLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-tracking/:id"
                element={
                  <PrivateRoute>
                    <CustomerLayout>
                      <OrderTracking />
                    </CustomerLayout>
                  </PrivateRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast Container for notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;