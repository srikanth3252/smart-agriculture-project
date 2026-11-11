import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'farmer') return '/farmer-dashboard';
    if (user.role === 'customer') return '/customer-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/';
  };

  return (
    <nav className="site-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🌱</div>
          <div className="brand-text-group">
            <span className="brand-title">FarmerMarket</span>
            <span className="brand-subtitle">Direct Farm to Door</span>
          </div>
        </Link>

        {/* Mobile menu button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* Links */}
        <ul className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/prices"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Market Prices
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/suggest"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Crop Guide
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>
          </li>

          {/* Role-specific shortcut links */}
          {isAuthenticated && (
            <li>
              <NavLink
                to={getDashboardPath()}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        {/* Action buttons on right */}
        <div className="navbar-actions">
          {isAuthenticated && user?.role === 'customer' && (
            <Link to="/cart" className="cart-link" title="Shopping Cart">
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-tag">
                <span>{user.name.split(' ')[0]}</span>
                <span className="user-role-pill">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

