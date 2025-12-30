import api from './api';

export const orderApi = {
  // Get current user's orders
  getMyOrders: (page = 0, size = 10) => {
    return api.get(`/orders/my-orders?page=${page}&size=${size}`);
  },

  // Get order by ID
  getOrderById: (id) => {
    return api.get(`/orders/${id}`);
  },

  // Get all orders (admin)
  getAllOrders: (page = 0, size = 10) => {
    return api.get(`/orders?page=${page}&size=${size}`);
  },

  // Create order
  createOrder: (data) => {
    return api.post('/orders', data);
  },

  // Cancel order
  cancelOrder: (id) => {
    return api.post(`/orders/${id}/cancel`);
  },

  // Get order statistics
  getOrderStatistics: () => {
    return api.get('/orders/statistics');
  },

  // Update order status (admin)
  updateOrderStatus: (id, data) => {
    return api.put(`/orders/${id}/status`, data);
  },

  // Update delivery status (admin)
  updateDeliveryStatus: (id, data) => {
    return api.put(`/orders/${id}/delivery-status`, data);
  },
};

