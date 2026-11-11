import api from './api';

export const priceService = {
  async getPrices() {
    return api.get('/prices');
  },

  async addPrice(priceData) {
    return api.post('/prices', priceData);
  },

  async updatePrice(id, priceData) {
    return api.put(`/prices/${id}`, priceData);
  },

  async getCropSuggestions(params) {
    return api.post('/suggest', params);
  }
};

export default priceService;

