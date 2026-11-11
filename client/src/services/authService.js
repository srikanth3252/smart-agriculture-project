import api from './api';

export const authService = {
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async updateProfile(profileData) {
    return api.put('/auth/profile', profileData);
  }
};

export default authService;

