import api from './api';

export const userApi = {
  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Get current user profile
  getProfile: () => {
    return api.get('/user/profile');
  },

  // Update profile
  updateProfile: (data) => {
    return api.put('/user/profile', data);
  },

  // Change password
  changePassword: (data) => {
    return api.put('/user/password', data);
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post('/user/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return api.post('/user/reset-password', { token, newPassword });
  },
};

