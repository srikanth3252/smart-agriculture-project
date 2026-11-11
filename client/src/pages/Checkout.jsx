import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!deliveryAddress.trim() || !deliveryPhone.trim()) {
      setError('Please provide a complete delivery address and phone number.');
      return;
    }

    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    try {
      setLoading(true);
      const res = await orderService.createOrder({
        deliveryAddress,
        deliveryPhone,
        paymentMethod: 'Cash on Delivery',
        notes,
        items: items.map(it => ({
          productId: it.product_id,
          quantity: it.quantity
        }))
      });

      if (res.order) {
        setConfirmedOrder({
          ...res.order,
          address: deliveryAddress,
          phone: deliveryPhone
        });
        await clearCart();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Some items may have run out of stock.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="page-container checkout-page">
        <div className="checkout-success-card">
          <div className="checkout-success-icon">✓</div>
          <h1 className="checkout-success-title">Order Confirmed!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Your farm produce order has been recorded directly with the farmers.
          </p>

          <div className="checkout-success-meta">
            <div><strong>Order ID:</strong> #{confirmedOrder.orderId}</div>
            <div><strong>Total Payable:</strong> ₹{confirmedOrder.totalAmount} (Cash on Delivery)</div>
            <div><strong>Payment Method:</strong> Cash on Delivery (COD)</div>
            <div><strong>Deliver to:</strong> {confirmedOrder.address}</div>
            <div><strong>Contact:</strong> {confirmedOrder.phone}</div>
          </div>

          <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>
            The farmer has been notified and will verify the harvest before dispatching your order.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/customer-dashboard" className="btn btn-primary">
              View in My Orders →
            </Link>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container checkout-page">
      <h1 className="checkout-title">Finalize Harvest Checkout</h1>
      <p className="checkout-sub">
        Confirm delivery address and select Cash on Delivery.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty. Please add items before checking out.</p>
          <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="checkout-layout">
          {/* Left: Delivery Details Form */}
          <div className="checkout-card">
            <h3 className="checkout-card-head">1. Delivery Information</h3>

            <div className="form-group">
              <label className="form-label">Full Recipient Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="form-input"
                style={{ backgroundColor: 'var(--bg-page)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number for Delivery</label>
              <input
                type="tel"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                placeholder="10-digit delivery phone"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exact Delivery Address & Pincode</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House/Flat number, Street, Landmark, District, Pincode"
                className="form-textarea"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Order Notes / Landmark Instructions (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Leave with security guard, call upon arrival"
                className="form-input"
              />
            </div>

            <div className="checkout-payment-box">
              <span>💵</span>
              <div>
                <div>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                  Pay cash directly when the farmer delivers your produce.
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-card">
            <h3 className="checkout-card-head">2. Order Review ({items.length} crops)</h3>

            <div className="checkout-items-summary">
              {items.map((it) => (
                <div key={it.cart_item_id} className="checkout-item-line">
                  <div>
                    <strong>{it.product_name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {it.quantity} {it.unit} × ₹{parseFloat(it.price).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    ₹{(parseFloat(it.price) * parseFloat(it.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '8px' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Delivery Charges:</span>
              <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>FREE</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '12px', color: 'var(--primary-dark)' }}>
              <span>Total Amount:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Processing Transaction...' : 'Confirm & Place COD Order'}
            </button>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Stock will be locked atomically via MySQL ACID transactions.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

