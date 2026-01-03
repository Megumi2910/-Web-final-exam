package com.second_project.ecommerce.controller.rest;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.PageResponse;
import com.second_project.ecommerce.model.ReviewDto;
import com.second_project.ecommerce.security.CustomUserDetails;
import com.second_project.ecommerce.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for Review management.
 * Handles review-related API endpoints.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewRestController {

    private final ReviewService reviewService;

    /**
     * Create a new review for a product.
     * Requires authentication.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @Valid @RequestBody ReviewDto reviewDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            ReviewDto createdReview = reviewService.createReview(reviewDto, currentUser.getUserId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Review created successfully", createdReview));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create review"));
        }
    }

    /**
     * Update an existing review.
     * Only the review owner can update.
     */
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDto>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewDto reviewDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            ReviewDto updatedReview = reviewService.updateReview(reviewId, reviewDto, currentUser.getUserId());
            return ResponseEntity.ok(ApiResponse.success("Review updated successfully", updatedReview));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update review"));
        }
    }

    /**
     * Delete a review.
     * Only the review owner or admin can delete.
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            reviewService.deleteReview(reviewId, currentUser.getUserId());
            return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete review"));
        }
    }

    /**
     * Get review by ID.
     * Public endpoint.
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewDto>> getReviewById(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            Long userId = currentUser != null ? currentUser.getUserId() : null;
            ReviewDto review = reviewService.getReviewById(reviewId, userId);
            return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", review));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve review"));
        }
    }

    /**
     * Get all reviews for a product with pagination.
     * Public endpoint.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<PageResponse<ReviewDto>> getReviewsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) Integer rating,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
                    Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Long userId = currentUser != null ? currentUser.getUserId() : null;
            Page<ReviewDto> reviewPage = reviewService.getReviewsByProductId(productId, pageable, userId);

            // Filter by rating if provided (filter in memory for now)
            if (rating != null && rating >= 1 && rating <= 5) {
                java.util.List<ReviewDto> filtered = reviewPage.getContent().stream()
                        .filter(review -> review.getRating().equals(rating))
                        .collect(java.util.stream.Collectors.toList());
                reviewPage = new org.springframework.data.domain.PageImpl<>(
                        filtered, pageable, filtered.size());
            }

            return ResponseEntity.ok(PageResponse.success(
                    "Reviews retrieved successfully",
                    reviewPage.getContent(),
                    reviewPage.getNumber(),
                    reviewPage.getSize(),
                    reviewPage.getTotalElements(),
                    reviewPage.getTotalPages()
            ));
        } catch (Exception e) {
            log.error("Error retrieving reviews for product {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PageResponse.success("Failed to retrieve reviews", 
                            java.util.Collections.emptyList(), 0, size, 0L, 0));
        }
    }

    /**
     * Get reviews by user ID with pagination.
     * Public endpoint.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<ReviewDto>> getReviewsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ReviewDto> reviewPage = reviewService.getReviewsByUserId(userId, pageable);

            return ResponseEntity.ok(PageResponse.success(
                    "User reviews retrieved successfully",
                    reviewPage.getContent(),
                    reviewPage.getNumber(),
                    reviewPage.getSize(),
                    reviewPage.getTotalElements(),
                    reviewPage.getTotalPages()
            ));
        } catch (Exception e) {
            log.error("Error retrieving reviews for user {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PageResponse.success("Failed to retrieve user reviews", 
                            java.util.Collections.emptyList(), 0, size, 0L, 0));
        }
    }

    /**
     * Get average rating for a product.
     * Public endpoint.
     */
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Long productId) {
        try {
            Double avgRating = reviewService.getAverageRating(productId);
            return ResponseEntity.ok(ApiResponse.success("Average rating retrieved successfully", avgRating));
        } catch (Exception e) {
            log.error("Error retrieving average rating for product {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve average rating"));
        }
    }

    /**
     * Get review count for a product.
     * Public endpoint.
     */
    @GetMapping("/product/{productId}/count")
    public ResponseEntity<ApiResponse<Long>> getReviewCount(@PathVariable Long productId) {
        try {
            Long count = reviewService.getReviewCount(productId);
            return ResponseEntity.ok(ApiResponse.success("Review count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error retrieving review count for product {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve review count"));
        }
    }

    /**
     * Get rating distribution for a product.
     * Returns map with rating (1-5) as key and count as value.
     * Public endpoint.
     */
    @GetMapping("/product/{productId}/distribution")
    public ResponseEntity<ApiResponse<Map<Integer, Long>>> getRatingDistribution(@PathVariable Long productId) {
        try {
            Map<Integer, Long> distribution = reviewService.getRatingDistribution(productId);
            return ResponseEntity.ok(ApiResponse.success("Rating distribution retrieved successfully", distribution));
        } catch (Exception e) {
            log.error("Error retrieving rating distribution for product {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve rating distribution"));
        }
    }

    /**
     * Check if user has reviewed a product.
     * Requires authentication.
     */
    @GetMapping("/product/{productId}/check")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> hasUserReviewedProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            boolean hasReviewed = reviewService.hasUserReviewedProduct(currentUser.getUserId(), productId);
            return ResponseEntity.ok(ApiResponse.success("Check completed", hasReviewed));
        } catch (Exception e) {
            log.error("Error checking if user reviewed product {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check review status"));
        }
    }

    /**
     * Get user's review for a specific product.
     * Requires authentication.
     */
    @GetMapping("/product/{productId}/my-review")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDto>> getUserReviewForProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            ReviewDto review = reviewService.getUserReviewForProduct(currentUser.getUserId(), productId);
            if (review != null) {
                return ResponseEntity.ok(ApiResponse.success("User review retrieved successfully", review));
            } else {
                return ResponseEntity.ok(ApiResponse.success("User has not reviewed this product", null));
            }
        } catch (Exception e) {
            log.error("Error retrieving user review for product {}", productId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user review"));
        }
    }
}

