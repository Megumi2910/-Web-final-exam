import api from './api';

export const sellerApi = {
  // Get seller's products
  getMyProducts: (page = 0, size = 20) => {
    return api.get(`/seller/products?page=${page}&size=${size}`);
  },

  // Get seller's orders
  getMyOrders: () => {
    return api.get('/seller/orders');
  },

  // Get seller statistics
  getStatistics: () => {
    return api.get('/seller/statistics');
  },

  // Get seller dashboard stats (alias for getStatistics)
  getDashboardStats: () => {
    return api.get('/seller/statistics');
  },

  // Update seller profile (store name, description, address)
  updateProfile: (data) => {
    return api.put('/seller/profile', data);
  },

  // Create product
  createProduct: (data) => {
    return api.post('/seller/products', data);
  },

  // Update product
  updateProduct: (id, data) => {
    return api.put(`/seller/products/${id}`, data);
  },

  // Delete product
  deleteProduct: (id) => {
    return api.delete(`/seller/products/${id}`);
  },
};

