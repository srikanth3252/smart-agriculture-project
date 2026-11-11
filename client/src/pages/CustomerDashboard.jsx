import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import authService from '../services/authService';
import './CustomerDashboard.css';

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        if (res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Customer orders load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setMessage({ type: '', text: '' });
      const res = await authService.updateProfile(profileData);
      if (res.user) {
        updateUser(res.user);
        setMessage({ type: 'success', text: 'Profile & delivery address updated successfully!' });
        setEditingProfile(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="page-container customer-dashboard">
      <div className="customer-header">
        <h1 className="customer-title">Customer Dashboard</h1>
        <p className="customer-subtitle">
          Manage your personal delivery profile and track fresh harvest orders.
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="customer-layout">
        {/* Left Column: Profile Card */}
        <div className="customer-profile-card">
          <div className="customer-profile-head">
            <div className="customer-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="customer-profile-name">{user?.name}</div>
              <div className="customer-profile-email">{user?.email}</div>
            </div>
          </div>

          {!editingProfile ? (
            <div>
              <div className="form-group">
                <span className="form-label">Contact Phone</span>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{user?.phone || 'Not provided'}</p>
              </div>

              <div className="form-group">
                <span className="form-label">Delivery Address</span>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {user?.address || 'No default delivery address set.'}
                </p>
              </div>

              <button
                onClick={() => setEditingProfile(true)}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', marginTop: '12px' }}
              >
                Edit Delivery Address
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Delivery Address</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/products" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Explore Marketplace Crops →
            </Link>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="customer-orders-card">
          <div className="customer-orders-head">
            <h3>Your Order History ({orders.length})</h3>
            <Link to="/products" className="btn btn-outline btn-sm">
              + New Order
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading your order history...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>You haven't placed any orders yet.</p>
              <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Start Shopping Fresh Harvests
              </Link>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((ord) => (
                <div key={ord.id} className="order-box">
                  <div className="order-box-header">
                    <span className="order-id-date">
                      Order #{ord.id} • {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                    <span className={`badge badge-${ord.order_status.toLowerCase()}`}>
                      {ord.order_status}
                    </span>
                  </div>

                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Farmer</th>
                        <th>Qty</th>
                        <th>Price/Unit</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ord.items && ord.items.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.product_name}</strong></td>
                          <td style={{ color: 'var(--text-muted)' }}>{item.farmer_name}</td>
                          <td>{item.quantity} {item.unit}</td>
                          <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹{parseFloat(item.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="order-box-footer">
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Payment: </span>
                      <strong>{ord.payment_method}</strong>
                      <span style={{ margin: '0 8px', color: 'var(--border-color)' }}>|</span>
                      <span style={{ color: 'var(--text-muted)' }}>Deliver to: </span>
                      <span style={{ fontSize: '12px' }}>{ord.delivery_address}</span>
                    </div>

                    <div className="order-total-sum">
                      Total: ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

