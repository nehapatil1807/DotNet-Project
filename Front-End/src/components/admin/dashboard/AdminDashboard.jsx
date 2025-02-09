import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { orderService } from '../../../services/orderService';
import { productService } from '../../../services/productService';
import { formatPrice } from '../../../utils/formatters';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, productsResponse] = await Promise.all([
        orderService.getAllOrders(),
        productService.getAllProducts()
      ]);

      if (ordersResponse.success && productsResponse.success) {
        const orders = ordersResponse.data || [];
        const products = productsResponse.data || [];
        
        // Calculate monthly revenue
        const monthlyData = calculateMonthlyRevenue(orders);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          recentOrders: orders.slice(0, 5),
          lowStockProducts: products.filter(p => p.stock < 5),
          monthlyRevenue: monthlyData
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders) => {
    const monthlyData = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + order.totalAmount;
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month,
        revenue: amount
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-cart3 fs-1"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Total Orders</h6>
                  <h2 className="mb-0">{stats.totalOrders}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-currency-dollar fs-1"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Total Revenue</h6>
                  <h2 className="mb-0">{formatPrice(stats.totalRevenue)}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-box-seam fs-1"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Total Products</h6>
                  <h2 className="mb-0">{stats.totalProducts}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card bg-warning text-dark h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-exclamation-triangle fs-1"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Low Stock Items</h6>
                  <h2 className="mb-0">{stats.lowStockProducts.length}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Revenue Trend</h5>
        </div>
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatPrice(value)}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0d6efd" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Orders */}
        <div className="col-12 col-xl-8 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Orders</h5>
              <Link to="/admin/orders" className="btn btn-primary btn-sm">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.userName}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>{formatPrice(order.totalAmount)}</td>
                        <td>
                          <Link 
                            to={`/admin/orders/${order.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="col-12 col-xl-4 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Low Stock Products</h5>
              <Link to="/admin/products" className="btn btn-primary btn-sm">Manage Stock</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="rounded me-2"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = '/placeholder.jpg' }}
                            />
                            <div>
                              <div className="text-truncate" style={{ maxWidth: '150px' }}>
                                {product.name}
                              </div>
                              <small className="text-muted">{product.categoryName}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-danger">{product.stock}</span>
                        </td>
                        <td>
                          <Link 
                            to={`/admin/products/${product.id}`}
                            className="btn btn-sm btn-outline-warning"
                          >
                            Update
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;