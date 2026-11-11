import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [role, setRole] = useState('customer'); // 'farmer', 'customer', 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email/phone and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ identifier, password, role });

      // Navigate based on user role
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else if (res.user.role === 'customer') {
        navigate('/customer-dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'farmer') {
      setIdentifier('ramesh.farmer@example.com');
      setPassword('Farmer@123');
    } else if (demoRole === 'customer') {
      setIdentifier('priya.customer@example.com');
      setPassword('Customer@123');
    } else if (demoRole === 'admin') {
      setIdentifier('admin@farmer.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌱</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your agricultural account</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-tab ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >
            Customer
          </button>
          <button
            type="button"
            className={`auth-role-tab ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => setRole('farmer')}
          >
            Farmer
          </button>
          <button
            type="button"
            className={`auth-role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              {role === 'farmer' ? 'Phone Number or Email' : 'Email Address or Phone'}
            </label>
            <input
              type="text"
              placeholder={role === 'farmer' ? 'e.g. 9876543210' : 'e.g. priya.customer@example.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="form-input"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Authenticating...' : `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <details className="auth-demo-credentials">
          <summary>Test Account Credentials (Auto-fill)</summary>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('farmer')}
            >
              Fill Farmer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('customer')}
            >
              Fill Customer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('admin')}
            >
              Fill Admin
            </button>
          </div>
        </details>

        <div className="auth-footer">
          Don't have an account yet? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

