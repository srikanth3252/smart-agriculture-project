import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SERVER_STATIC_URL } from '../services/api';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError('');
        const res = await productService.getProductById(id);
        if (res.product) {
          setProduct(res.product);
        }
      } catch (err) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.quantity || 1)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      alert('Only customer accounts can purchase crops.');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setFeedback('✓ Successfully added to cart!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-spinner">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'Product not found'}</div>
        <Link to="/products" className="btn btn-outline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOutOfStock = !product.is_available || parseFloat(product.quantity) <= 0;
  const imageUrl = product.image_url
    ? (product.image_url.startsWith('http') ? product.image_url : `${SERVER_STATIC_URL}${product.image_url}`)
    : null;

  return (
    <div className="page-container details-page">
      <div className="details-breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
      </div>

      <div className="details-card">
        {/* Left: Image */}
        <div className="details-image-box">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="details-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div
            className="details-image-fallback"
            style={{ display: imageUrl ? 'none' : 'block' }}
          >
            🌾
          </div>
        </div>

        {/* Right: Info & Purchase */}
        <div className="details-info">
          <span className="details-category-pill">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>

          <div className="details-price-row">
            <span className="details-price">₹{parseFloat(product.price).toFixed(2)}</span>
            <span className="details-unit">per {product.unit || 'kg'}</span>
          </div>

          <p className="details-desc">
            {product.description || 'Naturally cultivated local crop directly harvested and cleaned for distribution.'}
          </p>

          <div className="details-farmer-box">
            <div className="details-farmer-title">
              <span>👨‍🌾</span> Verified Farmer Details
            </div>
            <div className="details-farmer-meta">
              <div><strong>Farmer:</strong> {product.farmer_name}</div>
              <div><strong>Contact:</strong> {product.farmer_phone}</div>
              <div><strong>Location:</strong> {product.location}</div>
              <div><strong>Email:</strong> {product.farmer_email}</div>
            </div>
          </div>

          <div className={`details-stock-status ${isOutOfStock ? 'out' : ''}`}>
            {isOutOfStock
              ? '✕ Currently Out of Stock'
              : `✓ Available: ${product.quantity} ${product.unit} in farm stock`}
          </div>

          {feedback && <div className="alert alert-success">{feedback}</div>}

          {/* Add to Cart Actions */}
          {!isOutOfStock && (!isAuthenticated || user?.role === 'customer') && (
            <div className="details-purchase-box">
              <div className="details-qty-control">
                <button
                  type="button"
                  className="details-qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="details-qty-input"
                />
                <button
                  type="button"
                  className="details-qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantity}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn btn-primary btn-lg"
              >
                {adding ? 'Adding...' : `Add ${quantity} ${product.unit} to Cart`}
              </button>

              <Link to="/cart" className="btn btn-outline btn-lg">
                View Cart
              </Link>
            </div>
          )}

          {isAuthenticated && user?.role === 'farmer' && (
            <div className="alert alert-warning">
              You are signed in as a Farmer. Switch to a customer account to purchase crops.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

