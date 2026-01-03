import api from './api';

export const sellerApi = {
  // Get seller's products
  getMyProducts: (page = 0, size = 20) => {
    return api.get(`/seller/products?page=${page}&size=${size}`);
  },

  // Get seller's orders
  getMyOrders: (page = 0, size = 10) => {
    // Note: This endpoint may need to be created in backend
    return api.get(`/orders/seller/my-orders?page=${page}&size=${size}`);
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
};

