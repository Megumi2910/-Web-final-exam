import api from './api';

export const adminApi = {
  // Get all orders (admin)
  getAllOrders: (page = 0, size = 10) => {
    return api.get(`/orders/all?page=${page}&size=${size}`);
  },

  // Update order status (admin)
  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status?status=${status}`);
  },

  // Update delivery status (admin)
  updateDeliveryStatus: (id, data) => {
    return api.put(`/orders/${id}/delivery-status`, data);
  },

  // Get all products (admin can see all including pending)
  getAllProducts: (page = 0, size = 20) => {
    return api.get(`/admin/products?page=${page}&size=${size}`);
  },

  // Approve product (admin)
  approveProduct: (id) => {
    return api.put(`/admin/products/${id}/approve`);
  },

  // Reject product (admin)
  rejectProduct: (id) => {
    return api.put(`/admin/products/${id}/reject`);
  },

  // Get all users (admin)
  getAllUsers: (page = 0, size = 20, keyword = '') => {
    const params = new URLSearchParams({ page, size });
    if (keyword) {
      params.append('keyword', keyword);
    }
    return api.get(`/admin/users?${params.toString()}`);
  },

  // Get user by ID
  getUserById: (id) => {
    return api.get(`/admin/users/${id}`);
  },

  // Update user (admin)
  updateUser: (id, data) => {
    return api.put(`/admin/users/${id}`, data);
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

