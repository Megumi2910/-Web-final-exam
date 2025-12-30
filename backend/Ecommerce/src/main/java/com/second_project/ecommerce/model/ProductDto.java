package com.second_project.ecommerce.model;

import com.second_project.ecommerce.entity.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * DTO for Product entity.
 * Used to prevent lazy loading issues and control data exposure.
 * 
 * BEST PRACTICE: Separate DTO from entity to:
 * - Control what data is exposed
 * - Avoid circular references
 * - Prevent lazy loading exceptions
 * - Add validation specific to the use case
 */
@Data
public class ProductDto {

    private Long id;

    @NotBlank(message = "Tên sản phẩm là bắt buộc")
    @Size(max = 500, message = "Tên sản phẩm không được vượt quá 500 ký tự")
    private String name;

    @Size(max = 100, message = "Thương hiệu không được vượt quá 100 ký tự")
    private String brand;

    @Size(max = 50, message = "SKU không được vượt quá 50 ký tự")
    private String sku;

    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    private String slug;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @NotNull(message = "Giá là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Giá gốc phải lớn hơn hoặc bằng 0")
    private BigDecimal originalPrice;

    @NotNull(message = "Số lượng tồn kho là bắt buộc")
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stock;

    @Min(value = 0, message = "Số lượng đã bán phải lớn hơn hoặc bằng 0")
    private Integer soldCount;

    private List<String> images;

    private Boolean isFeatured;

    private Boolean isHot;

    private Boolean isNew;

    private Product.ProductStatus status;

    // Seller information (flattened from lazy-loaded relationship)
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;

    // Category IDs (flattened from lazy-loaded relationship)
    private Set<Long> categoryIds;
    private List<CategoryDto> categories; // For detailed category info when needed

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Double rating; // Average rating from reviews
    private Long reviewCount; // Total number of reviews

    // Alias methods for backward compatibility with frontend
    public String getImageUrl() {
        if (images != null && !images.isEmpty()) {
            return images.get(0);
        }
        return null;
    }

    public void setImageUrl(String imageUrl) {
        if (images == null) {
            images = new java.util.ArrayList<>();
        }
        if (!images.contains(imageUrl)) {
            images.add(0, imageUrl);
        }
    }

    public Long getProductId() {
        return id;
    }

    public void setProductId(Long productId) {
        this.id = productId;
    }
}

