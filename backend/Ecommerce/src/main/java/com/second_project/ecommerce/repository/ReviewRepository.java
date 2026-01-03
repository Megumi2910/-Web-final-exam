package com.second_project.ecommerce.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.Review;

/**
 * Repository interface for Review entity.
 * Provides CRUD operations and custom queries for review management.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    /**
     * Find reviews by product ID with pagination.
     * 
     * @param productId Product ID
     * @param pageable Pagination parameters
     * @return Page of product's reviews
     */
    Page<Review> findByProductId(Long productId, Pageable pageable);
    
    /**
     * Find reviews by user ID with pagination.
     * 
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of user's reviews
     */
    Page<Review> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Find reviews by product ID and rating.
     * 
     * @param productId Product ID
     * @param rating Rating value (1-5)
     * @param pageable Pagination parameters
     * @return Page of reviews with given product and rating
     */
    Page<Review> findByProductIdAndRating(Long productId, Integer rating, Pageable pageable);
    
    /**
     * Check if user has already reviewed a product.
     * 
     * @param productId Product ID
     * @param userId User ID
     * @return true if review exists
     */
    boolean existsByProductIdAndUserId(Long productId, Long userId);
    
    /**
     * Count reviews for a product.
     * 
     * @param productId Product ID
     * @return Number of reviews (including comments without ratings)
     */
    long countByProductId(Long productId);
    
    /**
     * Count reviews with ratings for a product.
     * Excludes admin/seller comments without ratings.
     * 
     * @param productId Product ID
     * @return Number of reviews with ratings
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.rating IS NOT NULL")
    long countByProductIdWithRating(@Param("productId") Long productId);
    
    /**
     * Count reviews by user ID.
     * 
     * @param userId User ID
     * @return Number of user's reviews
     */
    long countByUserId(Long userId);
    
    /**
     * Calculate average rating for a product.
     * Only includes reviews with ratings (excludes admin/seller comments).
     * 
     * @param productId Product ID
     * @return Average rating (or 0 if no reviews with ratings)
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId AND r.rating IS NOT NULL")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
    
    /**
     * Calculate average rating for a seller's products.
     * 
     * @param sellerId Seller ID
     * @return Average rating
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r JOIN r.product p WHERE p.seller.userId = :sellerId")
    Double getAverageRatingBySellerId(@Param("sellerId") Long sellerId);
    
    /**
     * Get rating distribution for a product (for star rating display).
     * Returns array of [rating, count].
     * Only includes reviews with ratings (excludes admin/seller comments).
     * 
     * @param productId Product ID
     * @return List of rating counts
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.rating IS NOT NULL GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByProductId(@Param("productId") Long productId);
    
    /**
     * Get user's review for a specific product.
     * 
     * @param productId Product ID
     * @param userId User ID
     * @return Review or null if not found
     */
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.user.userId = :userId")
    Review findByProductIdAndUserId(@Param("productId") Long productId, @Param("userId") Long userId);
}

