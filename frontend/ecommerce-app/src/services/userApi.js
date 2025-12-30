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
};

