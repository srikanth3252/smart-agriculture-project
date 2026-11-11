import api from './api';

export const adminService = {
  async getDashboardStats() {
    return api.get('/admin/dashboard');
  },

  async getAllUsers() {
    return api.get('/admin/users');
  },

  async toggleUserStatus(userId, isActive) {
    return api.put(`/admin/users/${userId}/status`, { isActive });
  },

  async getAllProducts() {
    return api.get('/admin/products');
  },

  async deleteProduct(productId) {
    return api.delete(`/admin/products/${productId}`);
  },

  async getAllOrders() {
    return api.get('/admin/orders');
  }
};

export default adminService;

