import api from './api';

export const categoryApi = {
  // Get all categories
  getAllCategories: () => {
    return api.get('/categories');
  },

  // Get active categories
  getActiveCategories: () => {
    return api.get('/categories/active');
  },

  // Get category by ID
  getCategoryById: (id) => {
    return api.get(`/categories/${id}`);
  },

  // Get category by slug
  getCategoryBySlug: (slug) => {
    return api.get(`/categories/slug/${slug}`);
  },
};

