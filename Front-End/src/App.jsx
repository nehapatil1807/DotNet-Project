import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastContainer } from 'react-toastify';
import { RouteGuard, AdminRoute, CustomerRoute, GuestRoute } from './components/routes/RouteGuard';

// Layouts
import AdminLayout from './components/admin/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';

// Admin Components
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import AdminProducts from './components/admin/products/AdminProducts';
import AdminOrders from './components/admin/orders/AdminOrders';

// Customer Components
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

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './styles/HomePage.css';
import './styles/ProductCard.css';
import './styles/admin.css';
import './styles/theme.css';

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

             {/* Public Routes */}
<Route
  path="/"
  element={
    <RouteGuard path="/">
      <CustomerLayout>
        <HomePage />
      </CustomerLayout>
    </RouteGuard>
  }
/>
<Route
  path="/products"
  element={
    <RouteGuard path="/products">
      <CustomerLayout>
        <ProductList />
      </CustomerLayout>
    </RouteGuard>
  }
/>
<Route
  path="/products/:id"
  element={
    <RouteGuard path="/products">
      <CustomerLayout>
        <ProductDetails />
      </CustomerLayout>
    </RouteGuard>
  }
/>

              {/* Protected Customer Routes */}
              <Route
                path="/cart"
                element={
                  <RouteGuard path="/cart">
                    <CustomerRoute>
                      <CustomerLayout>
                        <Cart />
                      </CustomerLayout>
                    </CustomerRoute>
                  </RouteGuard>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RouteGuard path="/checkout">
                    <CustomerRoute>
                      <CustomerLayout>
                        <Checkout />
                      </CustomerLayout>
                    </CustomerRoute>
                  </RouteGuard>
                }
              />
              <Route
                path="/orders"
                element={
                  <RouteGuard path="/orders">
                    <CustomerRoute>
                      <CustomerLayout>
                        <OrderList />
                      </CustomerLayout>
                    </CustomerRoute>
                  </RouteGuard>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <RouteGuard path="/orders">
                    <CustomerRoute>
                      <CustomerLayout>
                        <OrderDetails />
                      </CustomerLayout>
                    </CustomerRoute>
                  </RouteGuard>
                }
              />
              <Route
                path="/order-tracking/:id"
                element={
                  <RouteGuard path="/order-tracking">
                    <CustomerRoute>
                      <CustomerLayout>
                        <OrderTracking />
                      </CustomerLayout>
                    </CustomerRoute>
                  </RouteGuard>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="bottom-right"
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