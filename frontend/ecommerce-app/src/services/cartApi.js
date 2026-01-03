import api from './api';

export const cartApi = {
  // Get user's cart
  getCart: () => {
    return api.get('/cart');
  },

  // Add item to cart
  addToCart: (productId, quantity = 1) => {
    return api.post('/cart/items', null, {
      params: { productId, quantity }
    });
  },

  // Buy now - add to cart and redirect to checkout
  buyNow: (productId, quantity = 1) => {
    return api.post('/cart/buy-now', null, {
      params: { productId, quantity }
    });
  },

  // Update cart item
  updateCartItem: (cartItemId, quantity) => {
    return api.put(`/cart/items/${cartItemId}`, null, {
      params: { quantity }
    });
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

