import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleUpdate = async (itemId, currentQty, delta, maxStock) => {
    const newQty = parseFloat(currentQty) + delta;
    if (newQty <= 0) {
      await removeItem(itemId);
    } else if (newQty > maxStock) {
      alert(`Cannot add more than ${maxStock} units currently available in stock.`);
    } else {
      await updateQuantity(itemId, newQty);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-spinner">
        Loading shopping cart...
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const deliveryFee = items.length > 0 ? 0 : 0; // Free direct farm delivery
  const total = subtotal + deliveryFee;

  return (
    <div className="page-container cart-page">
      <h1 className="cart-title">Your Produce Shopping Cart 🛒</h1>
      <p className="cart-sub">
        Review farm harvests before confirming your direct Cash on Delivery order.
      </p>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p style={{ margin: '12px 0 20px' }}>Explore our marketplace to buy fresh crops directly from farmers.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Crops Now
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left Table */}
          <div className="cart-items-card">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Harvest Item</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.cart_item_id}>
                    <td>
                      <div className="cart-product-cell">
                        <Link to={`/products/${item.product_id}`} className="cart-product-title">
                          {item.product_name}
                        </Link>
                        <span className="cart-farmer-label">
                          Farmer: {item.farmer_name} • {item.location}
                        </span>
                      </div>
                    </td>

                    <td>
                      ₹{parseFloat(item.price).toFixed(2)} / {item.unit}
                    </td>

                    <td>
                      <div className="cart-qty-widget">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => handleUpdate(item.cart_item_id, item.quantity, -1, item.stock_quantity)}
                        >
                          −
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => handleUpdate(item.cart_item_id, item.quantity, 1, item.stock_quantity)}
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Stock: {item.stock_quantity} {item.unit}
                      </div>
                    </td>

                    <td>
                      <strong>₹{(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}</strong>
                    </td>

                    <td>
                      <button
                        onClick={() => removeItem(item.cart_item_id)}
                        className="cart-remove-btn"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/products" className="btn btn-outline btn-sm">
                ← Continue Browsing
              </Link>
              <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--danger-color)' }}>
                Empty Cart
              </button>
            </div>
          </div>

          {/* Right Summary */}
          <div className="cart-summary-card">
            <h3 className="cart-summary-head">Order Summary</h3>

            <div className="cart-summary-row">
              <span>Items Count:</span>
              <span>{items.length} items</span>
            </div>

            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Direct Farm Logistics:</span>
              <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>FREE (Direct Delivery)</span>
            </div>

            <div className="cart-summary-total-row">
              <span>Total Payable:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

