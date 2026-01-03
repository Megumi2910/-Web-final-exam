import api from './api';

export const productApi = {
  // Get all products with pagination
  getProducts: (page = 0, size = 20, sortBy = 'createdAt') => {
    return api.get(`/products?page=${page}&size=${size}&sortBy=${sortBy}`);
  },

  // Get product by ID
  getProductById: (id) => {
    return api.get(`/products/${id}`);
  },

  // Get product by slug
  getProductBySlug: (slug) => {
    return api.get(`/products/slug/${slug}`);
  },

  // Search products
  searchProducts: (keyword, page = 0, size = 20) => {
    return api.get(`/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  },

  // Get products by category
  getProductsByCategory: (categoryId, page = 0, size = 20) => {
    return api.get(`/products/category/${categoryId}?page=${page}&size=${size}`);
  },

  // Get featured products
  getFeaturedProducts: (limit = 10) => {
    return api.get(`/products/featured?limit=${limit}`);
  },

  // Get new products
  getNewProducts: (limit = 10) => {
    return api.get(`/products/new?limit=${limit}`);
  },

  // Get hot products
  getHotProducts: (limit = 10) => {
    return api.get(`/products/hot?limit=${limit}`);
  },

  // Get seller's products (public endpoint)
  getSellerProducts: (sellerId, page = 0, size = 20) => {
    return api.get(`/products/seller/${sellerId}?page=${page}&size=${size}`);
  },

  // Create product (seller/admin)
  createProduct: (data) => {
    return api.post('/products', data);
  },

  // Update product (seller/admin)
  updateProduct: (id, data) => {
    return api.put(`/products/${id}`, data);
  },

  // Delete product (seller/admin)
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },

  // Approve product (admin)
  approveProduct: (id) => {
    return api.put(`/products/${id}/approve`);
  },

  // Reject product (admin)
  rejectProduct: (id) => {
    return api.put(`/products/${id}/reject`);
  },
};

