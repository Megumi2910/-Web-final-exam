package com.second_project.ecommerce.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.second_project.ecommerce.entity.Payment;

import lombok.Data;

/**
 * DTO for Payment entity.
 * Used for API responses to avoid circular references.
 */
@Data
public class PaymentDto {
    
    private Long id;
    private Long orderId;
    
    private BigDecimal amount;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentStatus paymentStatus;
    private String transactionId;
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    
    // Alias for backward compatibility
    public String getTransactionCode() {
        return transactionId;
    }
    
    public void setTransactionCode(String transactionCode) {
        this.transactionId = transactionCode;
    }
    
    public Long getPaymentId() {
        return id;
    }
    
    public void setPaymentId(Long paymentId) {
        this.id = paymentId;
    }
}

