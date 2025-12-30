import api from './api';

export const cartApi = {
  // Get user's cart
  getCart: () => {
    return api.get('/cart');
  },

  // Add item to cart
  addToCart: (data) => {
    return api.post('/cart/items', data);
  },

  // Update cart item
  updateCartItem: (cartItemId, data) => {
    return api.put(`/cart/items/${cartItemId}`, data);
  },

  // Remove item from cart
  removeFromCart: (cartItemId) => {
    return api.delete(`/cart/items/${cartItemId}`);
  },

  // Clear cart
  clearCart: () => {
    return api.delete('/cart');
  },

  // Get cart item count
  getCartItemCount: () => {
    return api.get('/cart/count');
  },
};

