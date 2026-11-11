import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SERVER_STATIC_URL } from '../services/api';
import './ProductCard.css';

// Agricultural category icons for fallback display
const CATEGORY_ICONS = {
  Grains: '🌾',
  Vegetables: '🥦',
  Fruits: '🍎',
  Pulses: '🌱',
  Spices: '🌶️',
  Commercial: '🌿',
  Oilseeds: '🌻',
  General: '🍃'
};

export default function ProductCard({ product }) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);
  const navigate = useNavigate();

  const isOutOfStock = !product.is_available || parseFloat(product.quantity) <= 0;
  const icon = CATEGORY_ICONS[product.category] || '🌱';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      alert('Only customer accounts can add products to shopping cart.');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add product to cart');
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = product.image_url
    ? (product.image_url.startsWith('http') ? product.image_url : `${SERVER_STATIC_URL}${product.image_url}`)
    : null;

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="product-card-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="product-card-fallback"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <span className="product-card-fallback-icon">{icon}</span>
        </div>

        <span className="product-card-category">{product.category}</span>

        {isOutOfStock ? (
          <span className="product-card-stock-badge out-of-stock">Out of Stock</span>
        ) : (
          <span className="product-card-stock-badge">
            {product.quantity} {product.unit} left
          </span>
        )}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-desc">
          {product.description || 'Direct fresh crop from certified regional farmer.'}
        </p>

        <div className="product-card-meta">
          <div className="product-card-farmer">
            <span>👨‍🌾</span>
            <span>Farmer: <strong>{product.farmer_name || 'Verified Farmer'}</strong></span>
          </div>
          <div className="product-card-location">
            <span>📍</span>
            <span>{product.location}</span>
          </div>
        </div>

        <div className="product-card-footer">
          <div className="product-card-price-group">
            <span className="product-card-price">₹{parseFloat(product.price).toFixed(2)}</span>
            <span className="product-card-unit">per {product.unit || 'kg'}</span>
          </div>

          <div className="product-card-actions">
            <Link to={`/products/${product.id}`} className="btn btn-outline btn-sm">
              Details
            </Link>

            {(!isAuthenticated || user?.role === 'customer') && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className="btn btn-primary btn-sm"
              >
                {addedMessage ? '✓ Added' : adding ? '...' : '+ Cart'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

