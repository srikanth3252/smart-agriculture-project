import api from './api';

export const orderService = {
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  },

  async getMyOrders() {
    return api.get('/orders/my-orders');
  },

  async getFarmerOrders() {
    return api.get('/orders/farmer-orders');
  },

  async getFarmerStats() {
    return api.get('/orders/farmer-stats');
  },

  async getOrderById(id) {
    return api.get(`/orders/${id}`);
  },

  async updateOrderItemStatus(orderItemId, status) {
    return api.put(`/orders/${orderItemId}/status`, { status });
  }
};

export default orderService;

