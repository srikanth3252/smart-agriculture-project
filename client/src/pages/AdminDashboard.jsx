import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users'); // 'users', 'products', 'orders'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalPlatformSales: '0.00'
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, prodsRes, ordersRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getAllUsers(),
        adminService.getAllProducts(),
        adminService.getAllOrders()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.stats) {
        setStats(statsRes.value.stats);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.users) {
        setUsers(usersRes.value.users);
      }
      if (prodsRes.status === 'fulfilled' && prodsRes.value.products) {
        setProducts(prodsRes.value.products);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.orders) {
        setOrders(ordersRes.value.orders);
      }
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await adminService.toggleUserStatus(userId, newStatus);
      setMessage({
        type: 'success',
        text: `User account has been ${newStatus ? 'activated' : 'deactivated'}.`
      });
      loadAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update user status' });
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Delete this product listing from the platform?')) return;
    try {
      await adminService.deleteProduct(prodId);
      setMessage({ type: 'success', text: 'Product listing removed by admin.' });
      loadAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete product' });
    }
  };

  return (
    <div className="page-container admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">System Administration Portal 🛡️</h1>
        <p className="admin-sub">
          Monitor marketplace integrity, manage user accounts, and supervise crop listings.
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-num">{stats.totalUsers}</span>
          <span className="admin-stat-label">Total Users</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{stats.totalFarmers}</span>
          <span className="admin-stat-label">Registered Farmers</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{stats.totalCustomers}</span>
          <span className="admin-stat-label">Registered Customers</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{stats.totalProducts}</span>
          <span className="admin-stat-label">Total Listed Crops</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{stats.totalOrders}</span>
          <span className="admin-stat-label">Platform Orders</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">₹{stats.totalPlatformSales}</span>
          <span className="admin-stat-label">Gross Platform Volume</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          👥 User Accounts ({users.length})
        </button>
        <button
          className={`admin-tab-btn ${tab === 'products' ? 'active' : ''}`}
          onClick={() => setTab('products')}
        >
          🌾 Crop Moderation ({products.length})
        </button>
        <button
          className={`admin-tab-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          📦 Platform Orders ({orders.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading admin records...</div>
      ) : (
        <>
          {/* TAB 1: ALL USERS */}
          {tab === 'users' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`badge badge-role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-delivered' : 'badge-rejected'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', maxWidth: '200px' }}>{u.address || '—'}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUser(u.id, u.is_active)}
                            className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ALL PRODUCTS */}
          {tab === 'products' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Crop Name</th>
                    <th>Category</th>
                    <th>Farmer</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>{p.farmer_name}</td>
                      <td>₹{parseFloat(p.price).toFixed(2)}</td>
                      <td>{p.quantity} {p.unit}</td>
                      <td>{p.location}</td>
                      <td>
                        <span className={`badge ${p.is_available && p.quantity > 0 ? 'badge-delivered' : 'badge-rejected'}`}>
                          {p.is_available && p.quantity > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ALL ORDERS */}
          {tab === 'orders' && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>
                        <strong>{o.customer_name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          📞 {o.delivery_phone}
                        </div>
                      </td>
                      <td>
                        {o.items?.map((it) => (
                          <div key={it.id} style={{ fontSize: '12px' }}>
                            • {it.product_name} ({it.quantity} {it.unit})
                          </div>
                        ))}
                      </td>
                      <td><strong>₹{parseFloat(o.total_amount).toFixed(2)}</strong></td>
                      <td>{o.payment_method}</td>
                      <td>
                        <span className={`badge badge-${o.order_status.toLowerCase()}`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

