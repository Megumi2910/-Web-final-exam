package com.second_project.ecommerce.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.second_project.ecommerce.entity.Order;

import lombok.Data;

/**
 * DTO for Order entity.
 * Used for API responses to avoid lazy loading issues and circular references.
 */
@Data
public class OrderDto {
    
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    
    private List<OrderItemDto> items = new ArrayList<>();
    private PaymentDto payment;
    
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    
    private Order.OrderStatus orderStatus;
    private Order.DeliveryStatus deliveryStatus;
    
    private String shippingAddress;
    private String phoneNumber;
    private String notes;
    private String cancellationReason;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime orderDate;
    private LocalDateTime deliveredDate;
    
    // Alias methods for backward compatibility
    public Long getOrderId() {
        return id;
    }
    
    public void setOrderId(Long orderId) {
        this.id = orderId;
    }
    
    public Order.OrderStatus getStatus() {
        return orderStatus;
    }
    
    public void setStatus(Order.OrderStatus status) {
        this.orderStatus = status;
    }
}

