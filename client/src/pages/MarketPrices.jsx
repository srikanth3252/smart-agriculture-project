import React, { useEffect, useState } from 'react';
import priceService from '../services/priceService';
import './MarketPrices.css';

export default function MarketPrices() {
  const [prices, setPrices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        const res = await priceService.getPrices();
        if (res.data) {
          setPrices(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load market prices.');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  const filteredPrices = prices.filter((p) => {
    const matchesSearch = p.crop_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || p.category === category;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...new Set(prices.map((p) => p.category))];

  return (
    <div className="page-container prices-page">
      <div className="prices-header">
        <h1 className="prices-title">APMC Mandi Market Prices 📊</h1>
        <p className="prices-subtitle">
          Real-time standardized benchmark prices per quintal across agricultural commodity tiers.
        </p>
      </div>

      <div className="prices-toolbar">
        <div className="prices-search">
          <input
            type="text"
            placeholder="Search crop name (e.g. Wheat, Rice, Cotton)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading official APMC market rates...</div>
      ) : filteredPrices.length === 0 ? (
        <div className="empty-state">No price records found matching your search.</div>
      ) : (
        <div className="prices-grid">
          {filteredPrices.map((p) => (
            <div key={p.id} className="price-card">
              <div className="price-card-header">
                <div>
                  <h3 className="price-card-crop-name">{p.crop_name}</h3>
                  <span className="badge badge-role-farmer">{p.category}</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Per {p.unit || 'quintal'}
                </span>
              </div>

              <div className="price-tiers-list">
                <div className="price-tier-row">
                  <span className="price-tier-label">🔺 High Quality Rate</span>
                  <span className="price-tier-val val-high">₹{parseFloat(p.high_price).toFixed(0)}</span>
                </div>
                <div className="price-tier-row">
                  <span className="price-tier-label">✅ Good / Standard Rate</span>
                  <span className="price-tier-val val-good">₹{parseFloat(p.good_price).toFixed(0)}</span>
                </div>
                <div className="price-tier-row">
                  <span className="price-tier-label">📉 Average Modal Rate</span>
                  <span className="price-tier-val val-avg">₹{parseFloat(p.average_price).toFixed(0)}</span>
                </div>
                <div className="price-tier-row">
                  <span className="price-tier-label">⚠ Minimum / Low Rate</span>
                  <span className="price-tier-val val-low">₹{parseFloat(p.low_price).toFixed(0)}</span>
                </div>
              </div>

              <div className="price-card-footer">
                Benchmark APMC Mandi Index
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

