package com.second_project.ecommerce.model;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * DTO for Review entity.
 * Used for transferring review data between layers.
 */
public class ReviewDto {

    private Long id;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating; // Nullable for admin/seller comments

    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String comment;

    private Long userId;
    private String userName; // Full name of the reviewer
    private String userEmail;
    private String userAvatar; // User avatar URL if available
    private String userRole; // User role (CUSTOMER, SELLER, ADMIN)

    private Long productId;
    private String productName;
    private Long sellerId; // Product seller ID (to check if reviewer is the seller)

    private Boolean isVerifiedPurchase = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Permission flags
    private Boolean canEdit = false; // Can current user edit this review

    public ReviewDto() {}

    public ReviewDto(Long id, Integer rating, String comment, Long userId, String userName, 
                     Long productId, String productName, Boolean isVerifiedPurchase,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.userId = userId;
        this.userName = userName;
        this.productId = productId;
        this.productName = productName;
        this.isVerifiedPurchase = isVerifiedPurchase;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public Boolean getIsVerifiedPurchase() {
        return isVerifiedPurchase;
    }

    public void setIsVerifiedPurchase(Boolean isVerifiedPurchase) {
        this.isVerifiedPurchase = isVerifiedPurchase;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getCanEdit() {
        return canEdit;
    }

    public void setCanEdit(Boolean canEdit) {
        this.canEdit = canEdit;
    }

    @Override
    public String toString() {
        return "ReviewDto [id=" + id + ", rating=" + rating + ", userName=" + userName
                + ", productName=" + productName + ", createdAt=" + createdAt + "]";
    }
}

