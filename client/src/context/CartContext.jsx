import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.cart) {
        setCart(res.cart);
      }
    } catch {
      // Ignore initial cart errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartService.addToCart(productId, quantity);
    if (res.cart) {
      setCart(res.cart);
    }
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await cartService.updateQuantity(itemId, quantity);
    if (res.cart) {
      setCart(res.cart);
    }
    return res;
  };

  const removeItem = async (itemId) => {
    const res = await cartService.removeItem(itemId);
    if (res.cart) {
      setCart(res.cart);
    }
    return res;
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart(prev => prev ? { ...prev, items: [], subtotal: 0, totalItems: 0 } : null);
  };

  const cartCount = cart?.items?.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
