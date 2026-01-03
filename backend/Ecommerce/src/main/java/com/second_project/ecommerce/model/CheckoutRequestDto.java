package com.second_project.ecommerce.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for checkout request.
 * Used when user submits checkout form.
 */
@Data
public class CheckoutRequestDto {

    @NotBlank(message = "Shipping address is required")
    @Size(max = 500, message = "Shipping address must not exceed 500 characters")
    private String shippingAddress;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // "COD" or "QR"

    private String notes; // Optional order notes

    // Selected cart item IDs (comma-separated) - for future use if needed
    private String selectedCartItemIds;
}

