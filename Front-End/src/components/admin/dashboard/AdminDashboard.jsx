import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
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
  const [timeframe, setTimeframe] = useState('week');

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
      toast.error('Failed to load dashboard data');
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
      .slice(-6);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'shipped': return 'completed';
      case 'delivered': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
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
    <div className="dashboard-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-change positive">
            <i className="bi bi-arrow-up"></i>
            <span>12.5% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="bi bi-cart3"></i>
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-change positive">
            <i className="bi bi-arrow-up"></i>
            <span>8.2% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-change negative">
            <i className="bi bi-arrow-down"></i>
            <span>3.1% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-value">{stats.lowStockProducts.length}</div>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-change negative">
            <i className="bi bi-arrow-up"></i>
            <span>5 items need attention</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h5 className="chart-title">Revenue Overview</h5>
            <div className="chart-filters">
              <button 
                className={`chart-filter ${timeframe === 'week' ? 'active' : ''}`}
                onClick={() => setTimeframe('week')}
              >
                Week
              </button>
              <button 
                className={`chart-filter ${timeframe === 'month' ? 'active' : ''}`}
                onClick={() => setTimeframe('month')}
              >
                Month
              </button>
              <button 
                className={`chart-filter ${timeframe === 'year' ? 'active' : ''}`}
                onClick={() => setTimeframe('year')}
              >
                Year
              </button>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatPrice(value)}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return new Date(year, month - 1).toLocaleString('default', { 
                      month: 'long',
                      year: 'numeric'
                    });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#B4833E" 
                  strokeWidth={2}
                  dot={{ fill: '#B4833E', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="low-stock-card">
          <div className="orders-header">
            <h5 className="chart-title">Low Stock Products</h5>
            <Link to="/admin/products" className="btn btn-sm btn-primary">
              View All
            </Link>
          </div>
          <div className="orders-list">
            {stats.lowStockProducts.map((product) => (
              <div key={product.id} className="low-stock-item">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="admin-product-image"
                  onError={(e) => { e.target.src = '/placeholder.jpg' }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1">{product.name}</h6>
                  <small className="text-muted">{product.categoryName}</small>
                </div>
                <span className="stock-badge">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="orders-card">
        <div className="orders-header">
          <h5 className="chart-title">Recent Orders</h5>
          <Link to="/admin/orders" className="btn btn-sm btn-primary">
            View All Orders
          </Link>
        </div>
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
                  <td>
                    <div className="d-flex flex-column">
                      <span>{order.userName}</span>
                      <small className="text-muted">{order.shippingDetails.phone}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </td>
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
  );
};

export default AdminDashboard;