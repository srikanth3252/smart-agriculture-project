import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  return (
    <div className="page-container about-page">
      <div className="about-hero">
        <h1 className="about-title">About Farmer Marketplace</h1>
        <p className="about-subtitle">
          Direct Farmer-to-Consumer platform built to eliminate intermediaries, restore fair income to cultivators, and provide fresh agricultural harvests to urban households.
        </p>
      </div>

      <div className="about-card">
        <h3>🌱 The Problem in Indian Agriculture</h3>
        <p>
          In traditional agricultural supply chains, small and marginal farmers often receive less than 30% of the price paid by final urban consumers. Multiple layers of commission agents, mandi intermediaries, and logistics markups capture the majority of the profit margins, while produce loses freshness sitting in storage for days.
        </p>
        <p>
          Farmer Marketplace solves this fundamental imbalance by establishing a direct transactional channel connecting verified farmers directly with retail consumers.
        </p>
      </div>

      <div className="about-card">
        <h3>🚜 Core Architectural Highlights</h3>
        <div className="about-features-grid">
          <div className="about-feature-box">
            <h4>ACID MySQL Transactions</h4>
            <p>Order placement and stock deduction run in atomic MySQL transactions with row-level locks to prevent overselling.</p>
          </div>
          <div className="about-feature-box">
            <h4>Live Mandi Benchmark Index</h4>
            <p>Farmers can compare their own listing prices against APMC Mandi rates to set fair and competitive prices.</p>
          </div>
          <div className="about-feature-box">
            <h4>Agronomic Recommendation</h4>
            <p>Scientific recommendation system analyzing soil texture and seasonal climate to guide farmers on optimal crops.</p>
          </div>
          <div className="about-feature-box">
            <h4>Role Isolation & Security</h4>
            <p>Strict JWT and bcrypt authentication ensuring Farmers, Customers, and Administrators operate in dedicated workspaces.</p>
          </div>
        </div>
      </div>

      <div className="about-card" style={{ textAlign: 'center' }}>
        <h3>Ready to Explore the Platform?</h3>
        <p style={{ margin: '8px 0 20px' }}>
          Browse freshly listed harvests from our farmers or register your own farm produce today.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/products" className="btn btn-primary">
            Browse Produce Marketplace
          </Link>
          <Link to="/register" className="btn btn-outline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

