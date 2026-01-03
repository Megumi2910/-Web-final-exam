import api from './api';

export const reviewApi = {
  // Get reviews for a product
  getReviewsByProductId: async (productId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC', rating = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    if (rating) {
      params.append('rating', rating.toString());
    }
    return api.get(`/reviews/product/${productId}?${params.toString()}`);
  },

  // Get review by ID
  getReviewById: async (reviewId) => {
    return api.get(`/reviews/${reviewId}`);
  },

  // Create a review
  createReview: async (reviewData) => {
    return api.post('/reviews', reviewData);
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },

  // Get average rating for a product
  getAverageRating: async (productId) => {
    return api.get(`/reviews/product/${productId}/rating`);
  },

  // Get review count for a product
  getReviewCount: async (productId) => {
    return api.get(`/reviews/product/${productId}/count`);
  },

  // Get rating distribution for a product
  getRatingDistribution: async (productId) => {
    return api.get(`/reviews/product/${productId}/distribution`);
  },

  // Check if user has reviewed a product
  hasUserReviewedProduct: async (productId) => {
    return api.get(`/reviews/product/${productId}/check`);
  },

  // Get user's review for a product
  getUserReviewForProduct: async (productId) => {
    return api.get(`/reviews/product/${productId}/my-review`);
  },

  // Get reviews by user ID
  getReviewsByUserId: async (userId, page = 0, size = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    return api.get(`/reviews/user/${userId}?${params.toString()}`);
  }
};

