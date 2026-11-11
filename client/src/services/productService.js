import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/products${queryString}`);
  },

  async getProductById(id) {
    return api.get(`/products/${id}`);
  },

  async getFarmerProducts() {
    return api.get('/products/farmer/my-products');
  },

  async createProduct(formData) {
    return api.post('/products', formData);
  },

  async updateProduct(id, formData) {
    return api.put(`/products/${id}`, formData);
  },

  async deleteProduct(id) {
    return api.delete(`/products/${id}`);
  }
};

export default productService;

