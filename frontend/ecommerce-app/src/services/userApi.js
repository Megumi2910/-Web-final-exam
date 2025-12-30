import api from './api';

export const userApi = {
  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Update profile
  updateProfile: (data) => {
    return api.put('/users/profile', data);
  },

  // Change password
  changePassword: (data) => {
    return api.put('/users/change-password', data);
  },
};

