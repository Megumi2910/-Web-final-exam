package com.second_project.ecommerce.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

/**
 * DTO for Cart entity.
 * Used for API responses to avoid lazy loading issues.
 * 
 * BEST PRACTICE: Separate DTO from entity to:
 * - Control what data is exposed
 * - Avoid circular references
 * - Prevent lazy loading exceptions
 * - Add validation specific to the use case
 */
@Data
public class CartDto {
    
    private Long id;
    private Long userId;
    
    private List<CartItemDto> items = new ArrayList<>();
    
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private Integer totalItems = 0;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Calculate total items count from cart items
     */
    public void calculateTotals() {
        if (items == null || items.isEmpty()) {
            this.totalItems = 0;
            this.totalAmount = BigDecimal.ZERO;
            return;
        }
        
        this.totalItems = items.stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();
        
        this.totalAmount = items.stream()
                .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

