import api from './api';

export const categoryApi = {
  // Get all categories
  getAllCategories: () => {
    return api.get('/categories');
  },

  // Get active categories
  getActiveCategories: () => {
    return api.get('/categories');
  },

  // Get all categories (admin - includes inactive)
  getAllCategoriesAdmin: () => {
    return api.get('/categories/all');
  },

  // Get category by ID
  getCategoryById: (id) => {
    return api.get(`/categories/${id}`);
  },

  // Get category by slug
  getCategoryBySlug: (slug) => {
    return api.get(`/categories/slug/${slug}`);
  },

  // Create category (admin)
  createCategory: (data) => {
    return api.post('/categories', data);
  },

  // Update category (admin)
  updateCategory: (id, data) => {
    return api.put(`/categories/${id}`, data);
  },

  // Delete category (admin)
  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`);
  },
};

