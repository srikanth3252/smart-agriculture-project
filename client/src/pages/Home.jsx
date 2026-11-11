import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import priceService from '../services/priceService';
import './Home.css';

const CATEGORIES = [
  { name: 'Grains', icon: '🌾', desc: 'Wheat, Rice, Maize' },
  { name: 'Vegetables', icon: '🥦', desc: 'Tomatoes, Onions, Potatoes' },
  { name: 'Commercial', icon: '🌿', desc: 'Cotton, Sugarcane' },
  { name: 'Oilseeds', icon: '🌻', desc: 'Soybean, Groundnut' },
  { name: 'Pulses', icon: '🌱', desc: 'Gram, Lentils, Moong' },
  { name: 'Fruits', icon: '🍎', desc: 'Seasonal Orchards' }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [prodRes, priceRes] = await Promise.allSettled([
          productService.getProducts({ limit: 4 }),
          priceService.getPrices()
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data) {
          setFeaturedProducts(prodRes.value.data);
        }

        if (priceRes.status === 'fulfilled' && priceRes.value.data) {
          setMarketPrices(priceRes.value.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <div className="home-hero-badge">
              <span>🌾</span> Direct Farmer-to-Consumer Agricultural Network
            </div>
            <h1 className="home-hero-title">
              Fresh Harvests Directly From Local Indian Farmers
            </h1>
            <p className="home-hero-subtitle">
              Eliminate middlemen and high commissions. Buy verified agricultural crops directly from farmers at fair prices, or sell your farm harvest with transparent mandi benchmarks.
            </p>
            <div className="home-hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse Marketplace
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Become a Farmer
              </Link>
            </div>
          </div>

          <div className="home-hero-card">
            <div className="home-hero-card-header">
              <h3>🌱 Platform Live Benchmarks</h3>
            </div>
            <div className="home-hero-stat-grid">
              <div className="home-hero-stat">
                <div className="home-hero-stat-num">100%</div>
                <div className="home-hero-stat-label">Direct Farm Sourcing</div>
              </div>
              <div className="home-hero-stat">
                <div className="home-hero-stat-num">₹ 0</div>
                <div className="home-hero-stat-label">Middleman Commission</div>
              </div>
              <div className="home-hero-stat">
                <div className="home-hero-stat-num">COD</div>
                <div className="home-hero-stat-label">Cash on Delivery Available</div>
              </div>
              <div className="home-hero-stat">
                <div className="home-hero-stat-num">APMC</div>
                <div className="home-hero-stat-label">Daily Mandi Price Index</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES */}
      <section className="page-container">
        <div className="home-section-header">
          <span className="home-section-tag">Agricultural Diversity</span>
          <h2 className="home-section-title">Explore Produce by Category</h2>
          <p className="home-section-desc">
            Browse across grains, vegetables, oilseeds and commercial cash crops harvested locally.
          </p>
        </div>

        <div className="home-category-grid">
          {CATEGORIES.map((cat, idx) => (
            <Link
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              key={idx}
              className="home-category-card"
            >
              <div className="home-category-icon">{cat.icon}</div>
              <span className="home-category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="page-container">
        <div className="home-section-header">
          <span className="home-section-tag">Direct From Fields</span>
          <h2 className="home-section-title">Featured Farm Harvests</h2>
          <p className="home-section-desc">
            Recently posted high-quality crops available for direct order from our verified farmers.
          </p>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading fresh produce...</div>
        ) : featuredProducts.length > 0 ? (
          <div className="home-products-grid">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No featured products available at the moment.</p>
          </div>
        )}

        <div className="home-section-cta">
          <Link to="/products" className="btn btn-secondary btn-lg">
            View All Products & Search Filters →
          </Link>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="page-container">
        <div className="home-section-header">
          <span className="home-section-tag">Simple Process</span>
          <h2 className="home-section-title">How The Marketplace Works</h2>
          <p className="home-section-desc">
            A seamless four-step flow ensuring fair trade and genuine quality.
          </p>
        </div>

        <div className="home-steps-grid">
          <div className="home-step-card">
            <div className="home-step-number">1</div>
            <h4 className="home-step-title">Farmer Lists Produce</h4>
            <p className="home-step-desc">
              Farmers post crop details, pictures, price per kg/quintal, and real-time available stock.
            </p>
          </div>
          <div className="home-step-card">
            <div className="home-step-number">2</div>
            <h4 className="home-step-title">Customer Browses</h4>
            <p className="home-step-desc">
              Consumers and retail buyers search by crop name, category, location, and compare mandi prices.
            </p>
          </div>
          <div className="home-step-card">
            <div className="home-step-number">3</div>
            <h4 className="home-step-title">Direct Order & Dispatch</h4>
            <p className="home-step-desc">
              Order placed with atomic stock reservation. The farmer reviews and accepts for direct delivery.
            </p>
          </div>
          <div className="home-step-card">
            <div className="home-step-number">4</div>
            <h4 className="home-step-title">Cash on Delivery</h4>
            <p className="home-step-desc">
              Customer inspects the farm produce at their doorstep and pays directly with Cash on Delivery.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS FOR FARMERS & CUSTOMERS */}
      <section className="page-container">
        <div className="home-section-header">
          <span className="home-section-tag">Mutual Benefit</span>
          <h2 className="home-section-title">Why Choose Our Marketplace</h2>
          <p className="home-section-desc">
            Designed to empower both hardworking agricultural producers and quality-conscious consumers.
          </p>
        </div>

        <div className="home-benefits-wrapper">
          <div className="home-benefit-box">
            <h3 className="home-benefit-title">👨‍🌾 Benefits for Farmers</h3>
            <ul className="home-benefit-list">
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>No Intermediaries:</strong> Keep 100% of your selling price without paying commission to middlemen.</span>
              </li>
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Mandi Price Comparison:</strong> Compare your selling prices against live APMC benchmarks in real-time.</span>
              </li>
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Crop Suggestion Engine:</strong> Get tailored crop recommendations based on your soil type and season.</span>
              </li>
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Order Transparency:</strong> Manage customer orders, monitor status, and track historical revenue.</span>
              </li>
            </ul>
          </div>

          <div className="home-benefit-box">
            <h3 className="home-benefit-title">🛒 Benefits for Customers</h3>
            <ul className="home-benefit-list">
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Farm-Fresh Quality:</strong> Receive produce freshly harvested directly from the fields.</span>
              </li>
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Fair & Affordable Prices:</strong> Cut out retail markups and obtain genuine wholesale rates.</span>
              </li>
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Direct Farmer Contact:</strong> Know exactly where your food was grown and who cultivated it.</span>
              </li>
              <li className="home-benefit-item">
                <span className="home-benefit-check">✓</span>
                <span><strong>Secure Cash on Delivery:</strong> Pay only when the fresh produce arrives at your doorstep.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. MARKET PRICE HIGHLIGHTS */}
      {marketPrices.length > 0 && (
        <section className="page-container">
          <div className="home-section-header">
            <span className="home-section-tag">APMC Mandi Benchmarks</span>
            <h2 className="home-section-title">Live Market Price Highlights</h2>
            <p className="home-section-desc">
              Current market standards per quintal to help you trade with complete transparency.
            </p>
          </div>

          <div className="home-price-table-wrap">
            <table className="home-price-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Category</th>
                  <th>High (₹/Qtl)</th>
                  <th>Good (₹/Qtl)</th>
                  <th>Average (₹/Qtl)</th>
                  <th>Low (₹/Qtl)</th>
                </tr>
              </thead>
              <tbody>
                {marketPrices.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.crop_name}</strong></td>
                    <td>{p.category}</td>
                    <td className="price-high">₹{parseFloat(p.high_price).toFixed(0)}</td>
                    <td className="price-good">₹{parseFloat(p.good_price).toFixed(0)}</td>
                    <td className="price-avg">₹{parseFloat(p.average_price).toFixed(0)}</td>
                    <td className="price-low">₹{parseFloat(p.low_price).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="home-section-cta">
            <Link to="/prices" className="btn btn-outline">
              View All Market Crop Benchmarks →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

