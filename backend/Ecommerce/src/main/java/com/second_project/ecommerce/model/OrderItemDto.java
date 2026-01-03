package com.second_project.ecommerce.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

/**
 * DTO for OrderItem entity.
 * Used for API responses to avoid lazy loading issues and circular references.
 */
@Data
public class OrderItemDto {
    
    private Long id;
    
    // Product information (flattened from lazy-loaded relationship)
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImageUrl;
    private java.util.List<String> productImages;
    private BigDecimal productPrice;
    private Long sellerId;
    private String sellerName;
    private String storeName;
    
    // Order item specific fields
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String productVariant;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

