import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h4>🌱 FarmerMarket</h4>
          <p className="footer-desc">
            A transparent agricultural marketplace directly connecting local Indian farmers with consumers, ensuring fair crop prices, eliminating middlemen, and delivering fresh produce.
          </p>
        </div>

        <div className="footer-column">
          <h5>Quick Links</h5>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Browse Crops</Link></li>
            <li><Link to="/prices">APMC Market Prices</Link></li>
            <li><Link to="/suggest">Crop Suggestions</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h5>User Portals</h5>
          <ul className="footer-links">
            <li><Link to="/register">Become a Farmer</Link></li>
            <li><Link to="/login">Farmer Login</Link></li>
            <li><Link to="/login">Customer Portal</Link></li>
            <li><Link to="/about">About Platform</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h5>Technology Stack</h5>
          <ul className="footer-links">
            <li><span>React 19 & React Router</span></li>
            <li><span>Node.js & Express REST</span></li>
            <li><span>MySQL 8.0 with InnoDB</span></li>
            <li><span>ACID Transactions</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Farmer-to-Customer Marketplace. Built with React, Node.js and MySQL.</p>
        <p>Software Development Engineer Portfolio Project</p>
      </div>
    </footer>
  );
}

