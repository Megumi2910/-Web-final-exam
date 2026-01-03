package com.second_project.ecommerce.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.second_project.ecommerce.entity.Order.OrderStatus;
import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.Review;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ReviewDto;
import com.second_project.ecommerce.repository.OrderItemRepository;
import com.second_project.ecommerce.repository.ProductRepository;
import com.second_project.ecommerce.repository.ReviewRepository;
import com.second_project.ecommerce.repository.UserRepository;
import com.second_project.ecommerce.service.ReviewService;

/**
 * Implementation of ReviewService.
 * Handles all review-related business logic.
 */
@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             UserRepository userRepository,
                             ProductRepository productRepository,
                             OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public ReviewDto createReview(ReviewDto reviewDto, Long userId) {
        log.debug("Creating review for product {} by user {}", reviewDto.getProductId(), userId);

        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(reviewDto.getProductId(), userId)) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }

        // Get user and product
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Product product = productRepository.findById(reviewDto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Determine user role
        User.UserRole userRole = user.getRole();
        boolean isAdmin = userRole == User.UserRole.ADMIN;
        boolean isSeller = userRole == User.UserRole.SELLER;
        boolean isCustomer = userRole == User.UserRole.CUSTOMER;
        
        // Check if seller owns this product
        boolean isProductOwner = product.getSeller() != null && 
                                 product.getSeller().getUserId().equals(userId);

        // Validation based on user role
        if (isCustomer) {
            // Regular customers: must have purchased the product and provide a rating
            Boolean hasPurchased = checkIfUserPurchasedProduct(userId, reviewDto.getProductId());
            if (!hasPurchased) {
                throw new IllegalArgumentException("You must purchase this product before leaving a review");
            }
            if (reviewDto.getRating() == null || reviewDto.getRating() < 1 || reviewDto.getRating() > 5) {
                throw new IllegalArgumentException("Rating is required and must be between 1 and 5");
            }
        } else if (isAdmin) {
            // Admin: can comment without purchase, no rating required
            if (reviewDto.getRating() != null) {
                throw new IllegalArgumentException("Admin reviews cannot include ratings");
            }
            if (reviewDto.getComment() == null || reviewDto.getComment().trim().isEmpty()) {
                throw new IllegalArgumentException("Admin reviews must include a comment");
            }
        } else if (isSeller) {
            // Seller: can only comment on their own products, no rating
            if (!isProductOwner) {
                throw new IllegalArgumentException("Sellers can only comment on their own products");
            }
            if (reviewDto.getRating() != null) {
                throw new IllegalArgumentException("Seller reviews cannot include ratings");
            }
            if (reviewDto.getComment() == null || reviewDto.getComment().trim().isEmpty()) {
                throw new IllegalArgumentException("Seller reviews must include a comment");
            }
        }

        // Check if user has purchased the product (for verified purchase badge - only for customers)
        Boolean isVerifiedPurchase = isCustomer && checkIfUserPurchasedProduct(userId, reviewDto.getProductId());

        // Create review entity
        Review review = new Review();
        review.setRating(reviewDto.getRating()); // Can be null for admin/seller
        review.setComment(reviewDto.getComment());
        review.setUser(user);
        review.setProduct(product);
        review.setIsVerifiedPurchase(isVerifiedPurchase);

        // Save review
        review = reviewRepository.save(review);

        log.info("Review created successfully: {} by user {} (role: {})", review.getId(), userId, userRole);

        return convertToDto(review, userId);
    }

    @Override
    public ReviewDto updateReview(Long reviewId, ReviewDto reviewDto, Long userId) {
        log.debug("Updating review {} by user {}", reviewId, userId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        // Check if user owns this review
        if (!review.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to edit this review");
        }

        // Update review
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());

        review = reviewRepository.save(review);

        log.info("Review updated successfully: {}", reviewId);

        return convertToDto(review, userId);
    }

    @Override
    public void deleteReview(Long reviewId, Long userId) {
        log.debug("Deleting review {} by user {}", reviewId, userId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        // Check if user owns this review or is admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        boolean isOwner = review.getUser().getUserId().equals(userId);
        boolean isAdmin = user.getRole() == User.UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review deleted successfully: {}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewDto getReviewById(Long reviewId, Long currentUserId) {
        log.debug("Getting review {}", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        return convertToDto(review, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsByProductId(Long productId, Pageable pageable, Long currentUserId) {
        log.debug("Getting reviews for product {}", productId);

        Page<Review> reviewPage = reviewRepository.findByProductId(productId, pageable);

        List<ReviewDto> reviewDtos = reviewPage.getContent().stream()
                .map(review -> convertToDto(review, currentUserId))
                .collect(Collectors.toList());

        return new PageImpl<>(reviewDtos, pageable, reviewPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsByUserId(Long userId, Pageable pageable) {
        log.debug("Getting reviews by user {}", userId);

        Page<Review> reviewPage = reviewRepository.findByUserId(userId, pageable);

        List<ReviewDto> reviewDtos = reviewPage.getContent().stream()
                .map(review -> convertToDto(review, userId))
                .collect(Collectors.toList());

        return new PageImpl<>(reviewDtos, pageable, reviewPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(Long productId) {
        log.debug("Getting average rating for product {}", productId);
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        return avgRating != null ? avgRating : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getReviewCount(Long productId) {
        log.debug("Getting review count for product {}", productId);
        return reviewRepository.countByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Integer, Long> getRatingDistribution(Long productId) {
        log.debug("Getting rating distribution for product {}", productId);

        List<Object[]> distribution = reviewRepository.getRatingDistributionByProductId(productId);

        // Initialize map with all ratings (1-5) set to 0
        Map<Integer, Long> ratingMap = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingMap.put(i, 0L);
        }

        // Fill in actual counts
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = ((Number) row[1]).longValue();
            ratingMap.put(rating, count);
        }

        return ratingMap;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewRepository.existsByProductIdAndUserId(productId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewDto getUserReviewForProduct(Long userId, Long productId) {
        log.debug("Getting review by user {} for product {}", userId, productId);

        Review review = reviewRepository.findByProductIdAndUserId(productId, userId);
        return review != null ? convertToDto(review, userId) : null;
    }

    /**
     * Check if user has purchased the product (for verified purchase badge).
     * 
     * @param userId User ID
     * @param productId Product ID
     * @return true if user has a completed order containing this product
     */
    private Boolean checkIfUserPurchasedProduct(Long userId, Long productId) {
        try {
            // Check if there's an order item for this product and user with COMPLETED status
            // Using a query to check this efficiently
            boolean hasPurchased = orderItemRepository.existsByProductIdAndOrderUserIdAndOrderStatus(
                    productId, userId, OrderStatus.COMPLETED);
            log.debug("Purchase check for user {} and product {}: {}", userId, productId, hasPurchased);
            return hasPurchased;
        } catch (Exception e) {
            log.error("Failed to check purchase verification for user {} and product {}: {}", 
                    userId, productId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Convert Review entity to ReviewDto.
     * 
     * @param review Review entity
     * @param currentUserId Current user ID (can be null for guests)
     * @return ReviewDto
     */
    private ReviewDto convertToDto(Review review, Long currentUserId) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setIsVerifiedPurchase(review.getIsVerifiedPurchase() != null ? review.getIsVerifiedPurchase() : false);
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());

        // Set user information
        try {
            User user = review.getUser();
            dto.setUserId(user.getUserId());
            String userName = (user.getFirstName() != null ? user.getFirstName() : "") + " " + 
                             (user.getLastName() != null ? user.getLastName() : "");
            dto.setUserName(userName.trim());
            dto.setUserEmail(user.getEmail());
            dto.setUserRole(user.getRole() != null ? user.getRole().name() : null);
        } catch (Exception e) {
            log.warn("Failed to load user for review {}: {}", review.getId(), e.getMessage());
        }

        // Set product information
        try {
            Product product = review.getProduct();
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            // Set seller ID to check if reviewer is the seller
            if (product.getSeller() != null) {
                dto.setSellerId(product.getSeller().getUserId());
            }
        } catch (Exception e) {
            log.warn("Failed to load product for review {}: {}", review.getId(), e.getMessage());
        }

        // Check if current user can edit this review
        if (currentUserId != null) {
            try {
                dto.setCanEdit(review.getUser().getUserId().equals(currentUserId));
            } catch (Exception e) {
                log.warn("Failed to check edit permission for review {}: {}", review.getId(), e.getMessage());
            }
        }

        return dto;
    }
}

