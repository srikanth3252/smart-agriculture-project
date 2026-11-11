import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="page-container notfound-page">
      <div className="notfound-card">
        <div className="notfound-icon">🌾</div>
        <h1 className="notfound-title">404 — Page Not Found</h1>
        <p className="notfound-desc">
          The agricultural page or harvest listing you requested does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

