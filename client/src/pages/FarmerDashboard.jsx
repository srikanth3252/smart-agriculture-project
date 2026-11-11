import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import orderService from '../services/orderService';
import priceService from '../services/priceService';
import './FarmerDashboard.css';

const CATEGORIES = ['Grains', 'Vegetables', 'Commercial', 'Oilseeds', 'Pulses', 'Fruits'];
const UNITS = ['kg', 'quintal', 'ton'];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'orders', 'prices'

  // Data states
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSales: '0.00'
  });
  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add/Edit Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    location: user?.address || '',
    is_available: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Quick Crop Suggestion inside dashboard
  const [soil, setSoil] = useState('black');
  const [season, setSeason] = useState('summer');
  const [suggestedCrops, setSuggestedCrops] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodsRes, ordersRes, pricesRes] = await Promise.allSettled([
        orderService.getFarmerStats(),
        productService.getFarmerProducts(),
        orderService.getFarmerOrders(),
        priceService.getPrices()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.stats) {
        setStats(statsRes.value.stats);
      }
      if (prodsRes.status === 'fulfilled' && prodsRes.value.products) {
        setMyProducts(prodsRes.value.products);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.orders) {
        setMyOrders(ordersRes.value.orders);
      }
      if (pricesRes.status === 'fulfilled' && pricesRes.value.data) {
        setMarketPrices(pricesRes.value.data);
      }
    } catch (err) {
      console.error('Farmer dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grains',
      description: '',
      price: '',
      quantity: '',
      unit: 'kg',
      location: user?.address || '',
      is_available: true
    });
    setSelectedFile(null);
    setShowProductForm(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      description: prod.description || '',
      price: prod.price,
      quantity: prod.quantity,
      unit: prod.unit,
      location: prod.location,
      is_available: prod.is_available === 1 || prod.is_available === true
    });
    setSelectedFile(null);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      data.append('location', formData.location);
      data.append('is_available', formData.is_available);

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await productService.createProduct(data);
        setMessage({ type: 'success', text: 'Product added to marketplace!' });
      }

      setShowProductForm(false);
      loadDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save product' });
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await productService.deleteProduct(id);
      setMessage({ type: 'success', text: 'Product listing removed.' });
      loadDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete product' });
    }
  };

  const handleUpdateOrderStatus = async (orderItemId, newStatus) => {
    try {
      await orderService.updateOrderItemStatus(orderItemId, newStatus);
      setMessage({ type: 'success', text: `Order updated to ${newStatus}.` });
      loadDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update order' });
    }
  };

  const handleGetSuggestion = async () => {
    try {
      setLoadingSuggest(true);
      const res = await priceService.getCropSuggestions({ soil, season });
      setSuggestedCrops(res.crops || []);
    } catch (err) {
      alert('Failed to get crop suggestions');
    } finally {
      setLoadingSuggest(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container farmer-dashboard">
        <div className="farmer-loading">
          <div className="farmer-loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container farmer-dashboard">
      <div className="farmer-header">
        <h1 className="farmer-welcome">Farmer Command Center</h1>
        <p className="farmer-sub">
          Logged in as <strong>{user?.name}</strong> &bull; Direct Farmer Portal
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* 1. OVERVIEW METRICS */}
      <div className="farmer-stats-grid">
        <div className="farmer-stat-card">
          <div className="farmer-stat-icon">🌾</div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-value">{stats.totalProducts}</span>
            <span className="farmer-stat-label">Listed Crops</span>
          </div>
        </div>

        <div className="farmer-stat-card">
          <div className="farmer-stat-icon">📦</div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-value">{stats.totalOrders}</span>
            <span className="farmer-stat-label">Total Orders</span>
          </div>
        </div>

        <div className="farmer-stat-card">
          <div className="farmer-stat-icon">⏳</div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-value">{stats.pendingOrders}</span>
            <span className="farmer-stat-label">Pending Action</span>
          </div>
        </div>

        <div className="farmer-stat-card">
          <div className="farmer-stat-icon">✅</div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-value">{stats.completedOrders}</span>
            <span className="farmer-stat-label">Delivered Orders</span>
          </div>
        </div>

        <div className="farmer-stat-card">
          <div className="farmer-stat-icon">💰</div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-value">₹{stats.totalSales}</span>
            <span className="farmer-stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="farmer-tabs">
        <button
          className={`farmer-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Dashboard Overview
        </button>
        <button
          className={`farmer-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🌾 My Products ({myProducts.length})
        </button>
        <button
          className={`farmer-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Received Orders ({myOrders.length})
        </button>
        <button
          className={`farmer-tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          📈 Mandi Price Guidance & Crops
        </button>
      </div>

      {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
      {activeTab === 'overview' && (
        <div>
          <div className="farmer-section-head">
            <h3>Recent Farm Activity</h3>
            <button onClick={handleOpenAddForm} className="btn btn-primary btn-sm">
              + Post New Crop
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
            <div className="farmer-table-wrap">
              <h4 style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                Recent Customer Inquiries & Orders
              </h4>
              {myOrders.length === 0 ? (
                <div className="empty-state">No orders received yet.</div>
              ) : (
                <table className="farmer-table">
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Qty</th>
                      <th>Customer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.slice(0, 5).map((ord) => (
                      <tr key={ord.order_item_id}>
                        <td><strong>{ord.product_name}</strong></td>
                        <td>{ord.quantity} {ord.unit}</td>
                        <td>{ord.customer_name}</td>
                        <td>
                          <span className={`badge badge-${ord.item_status.toLowerCase()}`}>
                            {ord.item_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="farmer-price-compare-card">
              <h4>🌱 Recommended Actions</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '10px 0 16px' }}>
                Keep your available stock quantities accurate to avoid cancelled orders. Compare your selling prices with APMC mandi prices regularly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setActiveTab('products')} className="btn btn-outline btn-sm">
                  Review Inventory Levels ({myProducts.length} items)
                </button>
                <button onClick={() => setActiveTab('prices')} className="btn btn-outline btn-sm">
                  Check Current Mandi High/Good Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PRODUCTS (CRUD) */}
      {activeTab === 'products' && (
        <div>
          <div className="farmer-section-head">
            <h3>Manage Crop Catalog</h3>
            <button onClick={handleOpenAddForm} className="btn btn-primary btn-sm">
              + Add New Crop
            </button>
          </div>

          {/* Add / Edit Form Modal / Card */}
          {showProductForm && (
            <div className="farmer-form-card">
              <h4 style={{ marginBottom: '16px' }}>
                {editingProduct ? `Edit Crop: ${editingProduct.name}` : 'Post New Agricultural Crop'}
              </h4>

              <form onSubmit={handleProductSubmit}>
                <div className="farmer-form-grid">
                  <div className="form-group">
                    <label className="form-label">Crop Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharbati Wheat, Fresh Tomato"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-select"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price per Unit (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 28.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Available Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 500"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div style={{ width: '100px' }}>
                      <label className="form-label">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="form-select"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Farm Location (District, State)</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Maharashtra"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Image (JPEG, PNG, WebP)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Cultivation Method</label>
                  <textarea
                    placeholder="Enter harvest details, organic certifications, grain moisture, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                    rows={2}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  <label htmlFor="is_available" style={{ fontSize: '14px', cursor: 'pointer' }}>
                    Mark as Available for Direct Purchase
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="submit" disabled={submittingProduct} className="btn btn-primary">
                    {submittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Marketplace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Cards Grid */}
          {myProducts.length === 0 ? (
            <div className="empty-state">
              <p>You have not posted any crops yet.</p>
              <button onClick={handleOpenAddForm} className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Add Your First Crop
              </button>
            </div>
          ) : (
            <div className="farmer-product-grid">
              {myProducts.map((p) => (
                <div key={p.id} className="farmer-prod-card">
                  <div className="farmer-prod-card-top">
                    <div>
                      <h4>{p.name}</h4>
                      <span className="badge badge-role-farmer">{p.category}</span>
                    </div>
                    <span className={`badge ${p.is_available && p.quantity > 0 ? 'badge-delivered' : 'badge-rejected'}`}>
                      {p.is_available && p.quantity > 0 ? 'Active' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="farmer-prod-meta">
                    <div><strong>Price:</strong> ₹{parseFloat(p.price).toFixed(2)} / {p.unit}</div>
                    <div><strong>In Stock:</strong> {p.quantity} {p.unit}</div>
                    <div><strong>Location:</strong> {p.location}</div>
                  </div>

                  <div className="farmer-prod-actions">
                    <button
                      onClick={() => handleOpenEditForm(p)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECEIVED ORDERS */}
      {activeTab === 'orders' && (
        <div>
          <div className="farmer-section-head">
            <h3>Customer Orders for Your Crops</h3>
          </div>

          {myOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders received yet. When customers order your crops, they will appear here.</p>
            </div>
          ) : (
            <div className="farmer-table-wrap">
              <table className="farmer-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Crop Ordered</th>
                    <th>Qty & Total</th>
                    <th>Customer & Delivery Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((ord) => (
                    <tr key={ord.order_item_id}>
                      <td>#{ord.order_id}</td>
                      <td>
                        <strong>{ord.product_name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(ord.order_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div>{ord.quantity} {ord.unit}</div>
                        <strong>₹{parseFloat(ord.subtotal).toFixed(2)}</strong>
                      </td>
                      <td>
                        <div className="order-customer-box">
                          <span className="order-customer-name">{ord.customer_name}</span>
                          <span className="order-customer-phone">📞 {ord.delivery_phone}</span>
                          <span className="order-customer-addr">📍 {ord.delivery_address}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${ord.item_status.toLowerCase()}`}>
                          {ord.item_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {ord.item_status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.order_item_id, 'Accepted')}
                                className="btn btn-primary btn-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.order_item_id, 'Rejected')}
                                className="btn btn-danger btn-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {ord.item_status === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.order_item_id, 'Shipped')}
                              className="btn btn-secondary btn-sm"
                            >
                              Mark Shipped
                            </button>
                          )}
                          {ord.item_status === 'Shipped' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.order_item_id, 'Delivered')}
                              className="btn btn-primary btn-sm"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {(ord.item_status === 'Delivered' || ord.item_status === 'Rejected') && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MARKET GUIDANCE & CROP SUGGESTIONS */}
      {activeTab === 'prices' && (
        <div>
          <div className="farmer-section-head">
            <h3>APMC Mandi Benchmarks vs Your Selling Prices</h3>
          </div>

          <div className="farmer-table-wrap" style={{ marginBottom: '32px' }}>
            <table className="farmer-table">
              <thead>
                <tr>
                  <th>Benchmark Crop</th>
                  <th>Mandi Category</th>
                  <th>High Price</th>
                  <th>Good Price</th>
                  <th>Average Price</th>
                  <th>Low Price</th>
                  <th>Your Current Price</th>
                  <th>Guidance</th>
                </tr>
              </thead>
              <tbody>
                {marketPrices.map((mp) => {
                  const match = myProducts.find(
                    (p) => p.name.toLowerCase().includes(mp.crop_name.toLowerCase())
                  );
                  const farmerPrice = match ? parseFloat(match.price) : null;
                  const perKgGood = parseFloat(mp.good_price) / 100; // quintal to kg

                  return (
                    <tr key={mp.id}>
                      <td><strong>{mp.crop_name}</strong></td>
                      <td>{mp.category}</td>
                      <td style={{ color: '#1e8449', fontWeight: 600 }}>₹{mp.high_price}/Qtl</td>
                      <td style={{ color: '#27ae60', fontWeight: 600 }}>₹{mp.good_price}/Qtl</td>
                      <td style={{ color: '#d68910', fontWeight: 600 }}>₹{mp.average_price}/Qtl</td>
                      <td style={{ color: '#c0392b', fontWeight: 600 }}>₹{mp.low_price}/Qtl</td>
                      <td>
                        {farmerPrice ? (
                          <strong>₹{farmerPrice.toFixed(2)}/kg</strong>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Not listed</span>
                        )}
                      </td>
                      <td>
                        {farmerPrice ? (
                          farmerPrice > perKgGood * 1.2 ? (
                            <span className="price-indicator-chip price-indicator-high">Above APMC</span>
                          ) : (
                            <span className="price-indicator-chip price-indicator-competitive">Competitive</span>
                          )
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Embedded Crop Recommendation Tool */}
          <div className="farmer-price-compare-card">
            <h4>🌿 Crop Recommendation Engine</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Select your farm's soil type and the current season to receive scientifically vetted crop recommendations.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div style={{ minWidth: '180px' }}>
                <label className="form-label">Soil Type</label>
                <select
                  value={soil}
                  onChange={(e) => setSoil(e.target.value)}
                  className="form-select"
                >
                  <option value="black">Black Soil (High Moisture)</option>
                  <option value="red">Red Soil (Loamy / Well-drained)</option>
                  <option value="sandy">Sandy Soil (Rapid Drainage)</option>
                  <option value="clay">Clay / Alluvial Soil (Paddy Fields)</option>
                </select>
              </div>

              <div style={{ minWidth: '180px' }}>
                <label className="form-label">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="form-select"
                >
                  <option value="summer">Summer (Zaid)</option>
                  <option value="rainy">Monsoon / Rainy (Kharif)</option>
                  <option value="winter">Winter (Rabi)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGetSuggestion}
                disabled={loadingSuggest}
                className="btn btn-primary"
              >
                {loadingSuggest ? 'Analyzing...' : 'Get Recommendations'}
              </button>
            </div>

            {suggestedCrops.length > 0 && (
              <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--primary-dark)', display: 'block', marginBottom: '8px' }}>
                  Recommended Crops for {soil.toUpperCase()} soil in {season.toUpperCase()}:
                </strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {suggestedCrops.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: 'var(--color-white)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      🌾 {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

