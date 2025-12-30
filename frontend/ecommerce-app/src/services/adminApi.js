import api from './api';

export const adminApi = {
  // Get all orders (admin)
  getAllOrders: (page = 0, size = 10) => {
    return api.get(`/orders?page=${page}&size=${size}`);
  },

  // Update order status (admin)
  updateOrderStatus: (id, data) => {
    return api.put(`/orders/${id}/status`, data);
  },

  // Update delivery status (admin)
  updateDeliveryStatus: (id, data) => {
    return api.put(`/orders/${id}/delivery-status`, data);
  },

  // Get all products (admin can see all including pending)
  getAllProducts: (page = 0, size = 20) => {
    return api.get(`/products?page=${page}&size=${size}`);
  },

  // Approve product (admin)
  approveProduct: (id) => {
    return api.put(`/products/${id}/approve`);
  },

  // Reject product (admin)
  rejectProduct: (id) => {
    return api.put(`/products/${id}/reject`);
  },

  // Get all users (if endpoint exists, otherwise will need to be added to backend)
  getAllUsers: (page = 0, size = 20) => {
    // Note: This endpoint may need to be created in backend
    return api.get(`/users?page=${page}&size=${size}`);
  },

  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Get admin statistics (if endpoint exists)
  getStatistics: () => {
    // Note: This endpoint may need to be created in backend
    // For now, we'll calculate from existing data
    return Promise.resolve({ data: { data: null } });
  },

  // Get dashboard stats (if endpoint exists)
  getDashboardStats: () => {
    // Note: This endpoint may need to be created in backend
    // For now, we'll calculate from existing data
    return Promise.resolve({ data: { data: null } });
  },
};

