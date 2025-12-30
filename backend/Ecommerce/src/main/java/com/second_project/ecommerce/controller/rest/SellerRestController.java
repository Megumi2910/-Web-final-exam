package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.Category;
import com.second_project.ecommerce.entity.Order;
import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.PageResponse;
import com.second_project.ecommerce.model.ProductDto;
import com.second_project.ecommerce.repository.OrderRepository;
import com.second_project.ecommerce.repository.ProductRepository;
import com.second_project.ecommerce.repository.ReviewRepository;
import com.second_project.ecommerce.security.CustomUserDetails;
import com.second_project.ecommerce.service.CategoryService;
import com.second_project.ecommerce.service.OrderService;
import com.second_project.ecommerce.service.ProductService;
import com.second_project.ecommerce.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasRole('SELLER')")
@RequiredArgsConstructor
@Slf4j
public class SellerRestController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;
    private final CategoryService categoryService;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    // Product Management
    @GetMapping("/products")
    public ResponseEntity<PageResponse<ProductDto>> getSellerProducts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productService.findBySeller(seller, pageable);
        
        // Convert to DTOs
        List<ProductDto> dtos = productPage.getContent().stream()
                .map(product -> {
                    ProductDto dto = productService.findDtoById(product.getId())
                            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(PageResponse.success(
                "Seller products retrieved successfully",
                dtos,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        ));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ProductDto productDto) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if seller is approved
        if (!seller.getIsSellerApproved()) {
            throw new IllegalArgumentException("Seller is not approved");
        }

        // Set seller ID in DTO
        productDto.setSellerId(seller.getId());
        
        // Convert DTO to entity, set seller, then save
        Product product = convertDtoToEntity(productDto);
        product.setSeller(seller);
        Product savedProduct = productService.save(product);
        
        log.info("Product created by seller {}: {}", seller.getUserId(), savedProduct.getProductId());

        ProductDto savedDto = productService.findDtoById(savedProduct.getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        
        return ResponseEntity.ok(ApiResponse.success("Product created successfully. Awaiting admin approval.", savedDto));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody ProductDto productDetails) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product existingProduct = productService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Verify product belongs to seller
        if (!existingProduct.getSeller().getUserId().equals(seller.getUserId())) {
            throw new IllegalArgumentException("Product does not belong to seller");
        }

        ProductDto updatedProduct = productService.updateDto(id, productDetails);
        log.info("Product {} updated by seller {}", id, seller.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updatedProduct));
    }
    
    /**
     * Helper method to convert ProductDto to Product entity for seller operations
     */
    private Product convertDtoToEntity(ProductDto dto) {
        Product product = new Product();
        if (dto.getId() != null) {
            product.setId(dto.getId());
        }
        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setSku(dto.getSku());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setStock(dto.getStock() != null ? dto.getStock() : 0);
        product.setSoldCount(dto.getSoldCount() != null ? dto.getSoldCount() : 0);
        product.setImages(dto.getImages());
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsHot(dto.getIsHot() != null ? dto.getIsHot() : false);
        product.setIsNew(dto.getIsNew() != null ? dto.getIsNew() : false);
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : Product.ProductStatus.PENDING);
        
        // Set categories if provided
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            java.util.Set<Category> categories = dto.getCategoryIds().stream()
                    .map(categoryId -> categoryService.findById(categoryId)
                            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId)))
                    .collect(java.util.stream.Collectors.toSet());
            product.setCategories(categories);
        }
        
        return product;
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product product = productService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Verify product belongs to seller
        if (!product.getSeller().getUserId().equals(seller.getUserId())) {
            throw new IllegalArgumentException("Product does not belong to seller");
        }

        productService.delete(id);
        log.info("Product {} deleted by seller {}", id, seller.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getSellerOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Order> orders = orderService.findOrdersBySeller(seller);

        return ResponseEntity.ok(ApiResponse.success("Seller orders retrieved successfully", orders));
    }

    // Store Profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getSellerProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("Seller profile retrieved successfully", seller));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateSellerProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UpdateSellerProfileRequest request) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getStoreName() != null) {
            seller.setStoreName(request.getStoreName());
        }
        if (request.getStoreDescription() != null) {
            seller.setStoreDescription(request.getStoreDescription());
        }

        User updatedSeller = userService.save(seller);
        log.info("Seller profile updated for seller {}", seller.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Seller profile updated successfully", updatedSeller));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<SellerStatistics>> getSellerStatistics(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SellerStatistics stats = new SellerStatistics();
        
        // Product count
        stats.setTotalProducts(productRepository.countBySellerId(seller.getUserId()));
        
        // Order count
        stats.setTotalOrders(orderRepository.countOrdersBySellerId(seller.getUserId()));
        
        // Customer count (distinct customers who ordered)
        stats.setTotalCustomers(orderRepository.countDistinctCustomersBySellerId(seller.getUserId()));
        
        // Average rating
        Double avgRating = reviewRepository.getAverageRatingBySellerId(seller.getUserId());
        stats.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        // Revenue
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenueBySellerId(seller.getUserId());
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Monthly revenue
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyRevenue = orderRepository.calculateMonthlyRevenueBySellerId(seller.getUserId(), startOfMonth);
        stats.setMonthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);
        
        // Recent orders (last 5)
        Page<Order> recentOrders = orderRepository.findRecentOrdersBySellerId(seller.getUserId(), PageRequest.of(0, 5));
        stats.setRecentOrders(recentOrders.getContent().stream()
                .map(order -> {
                    SellerStatistics.OrderSummary orderSummary = new SellerStatistics.OrderSummary();
                    orderSummary.setId(order.getOrderNumber() != null ? order.getOrderNumber() : "#" + order.getId());
                    orderSummary.setCustomerName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
                    orderSummary.setTotal(order.getTotalAmount());
                    orderSummary.setStatus(order.getOrderStatus().name());
                    orderSummary.setTimeAgo(calculateTimeAgo(order.getOrderDate()));
                    return orderSummary;
                })
                .collect(Collectors.toList()));
        
        // Top products (top 5 by sales)
        Page<Product> topProducts = productRepository.findTopSellingProductsBySellerId(seller.getUserId(), PageRequest.of(0, 5));
        stats.setTopProducts(topProducts.getContent().stream()
                .map(product -> {
                    SellerStatistics.ProductSummary productSummary = new SellerStatistics.ProductSummary();
                    productSummary.setId(product.getProductId());
                    productSummary.setName(product.getName());
                    productSummary.setSales(product.getSoldCount() != null ? product.getSoldCount() : 0);
                    productSummary.setPrice(product.getPrice());
                    Double productRating = reviewRepository.getAverageRatingByProductId(product.getProductId());
                    productSummary.setRating(productRating != null ? productRating : 0.0);
                    return productSummary;
                })
                .collect(Collectors.toList()));
        
        // Completion rate (completed orders / total orders)
        long totalOrderCount = stats.getTotalOrders();
        long completedCount = orderRepository.countByUserIdAndOrderStatus(seller.getUserId(), Order.OrderStatus.COMPLETED);
        if (totalOrderCount > 0) {
            stats.setCompletionRate((double) completedCount / totalOrderCount * 100);
        } else {
            stats.setCompletionRate(0.0);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Seller statistics retrieved successfully", stats));
    }
    
    private String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return minutes + " phút trước";
        long hours = minutes / 60;
        if (hours < 24) return hours + " giờ trước";
        long days = hours / 24;
        return days + " ngày trước";
    }

    @Data
    public static class UpdateSellerProfileRequest {
        private String storeName;
        private String storeDescription;
    }
    
    @Data
    public static class SellerStatistics {
        private Long totalProducts;
        private Long totalOrders;
        private Long totalCustomers;
        private Double averageRating;
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private Double completionRate;
        private List<OrderSummary> recentOrders;
        private List<ProductSummary> topProducts;
        
        @Data
        public static class OrderSummary {
            private String id;
            private String customerName;
            private BigDecimal total;
            private String status;
            private String timeAgo;
        }
        
        @Data
        public static class ProductSummary {
            private Long id;
            private String name;
            private Integer sales;
            private BigDecimal price;
            private Double rating;
        }
    }
}


