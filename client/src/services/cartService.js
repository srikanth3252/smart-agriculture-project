import api from './api';

export const cartService = {
  async getCart() {
    return api.get('/cart');
  },

  async addToCart(productId, quantity = 1) {
    return api.post('/cart', { productId, quantity });
  },

  async updateQuantity(itemId, quantity) {
    return api.put(`/cart/${itemId}`, { quantity });
  },

  async removeItem(itemId) {
    return api.delete(`/cart/${itemId}`);
  },

  async clearCart() {
    return api.delete('/cart');
  }
};

export default cartService;

