package com.second_project.ecommerce.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

/**
 * DTO for CartItem entity.
 * Used for API responses to avoid lazy loading issues.
 * 
 * BEST PRACTICE: Separate DTO from entity to:
 * - Control what data is exposed
 * - Avoid circular references
 * - Prevent lazy loading exceptions
 * - Add validation specific to the use case
 */
@Data
public class CartItemDto {
    
    private Long id;
    private Long cartId;
    
    // Product information (flattened from lazy-loaded relationship)
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImageUrl;
    private java.util.List<String> productImages;
    private BigDecimal productPrice;
    private BigDecimal productOriginalPrice;
    private Integer productStock;
    private Long sellerId;
    private String sellerName;
    private String storeName;
    
    // Cart item specific fields
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String productVariant;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

