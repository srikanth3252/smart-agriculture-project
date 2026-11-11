import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

export default function Register() {
  const [role, setRole] = useState('farmer'); // 'farmer' or 'customer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !address.trim()) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name,
        email,
        phone,
        password,
        role,
        address
      });

      if (res.user.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create an Account</h1>
          <p className="register-subtitle">
            Join the agricultural marketplace to trade directly
          </p>
        </div>

        {/* Role Cards */}
        <div className="register-role-select-box">
          <div
            className={`role-card-btn ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => setRole('farmer')}
          >
            <div className="role-card-title">
              <span>👨‍🌾</span> Farmer
            </div>
            <span className="role-card-desc">
              List crops, monitor mandi benchmarks, manage incoming orders
            </span>
          </div>

          <div
            className={`role-card-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >
            <div className="role-card-title">
              <span>🛒</span> Customer
            </div>
            <span className="role-card-desc">
              Buy freshly harvested farm produce with Cash on Delivery
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="register-form-grid">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (min 6 characters)</label>
            <input
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {role === 'farmer' ? 'Farm Address & District' : 'Delivery Address'}
            </label>
            <textarea
              placeholder={role === 'farmer' ? 'Village, Taluka, District, State' : 'House/Flat No, Street, Landmark, City, State'}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-textarea"
              rows={2}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'farmer' ? 'Farmer' : 'Customer'}`}
          </button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}

