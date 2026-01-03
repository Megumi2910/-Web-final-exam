package com.second_project.ecommerce.service;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.second_project.ecommerce.model.ReviewDto;

/**
 * Service interface for Review management.
 * Provides business logic for review operations.
 */
public interface ReviewService {

    /**
     * Create a new review for a product.
     * 
     * @param reviewDto Review data
     * @param userId User ID
     * @return Created review DTO
     * @throws IllegalArgumentException if user already reviewed the product
     */
    ReviewDto createReview(ReviewDto reviewDto, Long userId);

    /**
     * Update an existing review.
     * Only the review owner can update.
     * 
     * @param reviewId Review ID
     * @param reviewDto Updated review data
     * @param userId User ID (for authorization)
     * @return Updated review DTO
     * @throws IllegalArgumentException if user is not the review owner
     */
    ReviewDto updateReview(Long reviewId, ReviewDto reviewDto, Long userId);

    /**
     * Delete a review.
     * Only the review owner or admin can delete.
     * 
     * @param reviewId Review ID
     * @param userId User ID (for authorization)
     * @throws IllegalArgumentException if user is not authorized
     */
    void deleteReview(Long reviewId, Long userId);

    /**
     * Get review by ID.
     * 
     * @param reviewId Review ID
     * @param currentUserId Current user ID (can be null for guests)
     * @return Review DTO
     */
    ReviewDto getReviewById(Long reviewId, Long currentUserId);

    /**
     * Get all reviews for a product with pagination.
     * 
     * @param productId Product ID
     * @param pageable Pagination parameters
     * @param currentUserId Current user ID (can be null for guests)
     * @return Page of reviews
     */
    Page<ReviewDto> getReviewsByProductId(Long productId, Pageable pageable, Long currentUserId);

    /**
     * Get reviews by user with pagination.
     * 
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of user's reviews
     */
    Page<ReviewDto> getReviewsByUserId(Long userId, Pageable pageable);

    /**
     * Get average rating for a product.
     * 
     * @param productId Product ID
     * @return Average rating (0.0 if no reviews)
     */
    Double getAverageRating(Long productId);

    /**
     * Get total review count for a product.
     * 
     * @param productId Product ID
     * @return Total review count
     */
    Long getReviewCount(Long productId);

    /**
     * Get rating distribution for a product.
     * Returns map with rating (1-5) as key and count as value.
     * 
     * @param productId Product ID
     * @return Rating distribution map
     */
    Map<Integer, Long> getRatingDistribution(Long productId);

    /**
     * Check if user has already reviewed a product.
     * 
     * @param userId User ID
     * @param productId Product ID
     * @return true if user has reviewed the product
     */
    boolean hasUserReviewedProduct(Long userId, Long productId);

    /**
     * Get user's review for a specific product.
     * 
     * @param userId User ID
     * @param productId Product ID
     * @return Review DTO or null if not found
     */
    ReviewDto getUserReviewForProduct(Long userId, Long productId);
}

