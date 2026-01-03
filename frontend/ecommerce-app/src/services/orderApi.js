import api from './api';

export const orderApi = {
  // Get current user's orders
  getMyOrders: (page = 0, size = 10) => {
    return api.get(`/orders?page=${page}&size=${size}`);
  },

  // Get order by ID
  getOrderById: (id) => {
    return api.get(`/orders/${id}`);
  },

  // Get all orders (admin)
  getAllOrders: (page = 0, size = 10) => {
    return api.get(`/orders/all?page=${page}&size=${size}`);
  },

  // Create order
  createOrder: (data) => {
    return api.post('/orders', data);
  },

  // Checkout (create order from cart)
  checkout: (data) => {
    return api.post('/orders/checkout', data);
  },

  // Cancel order
  cancelOrder: (id, cancellationReason = null) => {
    return api.put(`/orders/${id}/cancel`, {
      cancellationReason: cancellationReason
    });
  },

  // Get order statistics
  getOrderStatistics: () => {
    return api.get('/orders/statistics');
  },

  // Update order status (admin)
  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status?status=${status}`);
  },

  // Update delivery status (admin)
  updateDeliveryStatus: (id, data) => {
    return api.put(`/orders/${id}/delivery-status`, data);
  },
};

