package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.Order;
import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.PageResponse;
import com.second_project.ecommerce.security.CustomUserDetails;
import com.second_project.ecommerce.service.OrderService;
import com.second_project.ecommerce.service.ProductService;
import com.second_project.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasRole('SELLER')")
@RequiredArgsConstructor
@Slf4j
public class SellerRestController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;

    // Product Management
    @GetMapping("/products")
    public ResponseEntity<PageResponse<Product>> getSellerProducts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productService.findBySeller(seller, pageable);

        return ResponseEntity.ok(PageResponse.success(
                "Seller products retrieved successfully",
                productPage.getContent(),
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        ));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Product product) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if seller is approved
        if (!seller.getIsSellerApproved()) {
            throw new IllegalArgumentException("Seller is not approved");
        }

        product.setSeller(seller);
        Product savedProduct = productService.save(product);
        log.info("Product created by seller {}: {}", seller.getUserId(), savedProduct.getProductId());

        return ResponseEntity.ok(ApiResponse.success("Product created successfully. Awaiting admin approval.", savedProduct));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Product productDetails) {

        User seller = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Product existingProduct = productService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Verify product belongs to seller
        if (!existingProduct.getSeller().getUserId().equals(seller.getUserId())) {
            throw new IllegalArgumentException("Product does not belong to seller");
        }

        Product updatedProduct = productService.update(id, productDetails);
        log.info("Product {} updated by seller {}", id, seller.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updatedProduct));
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

    @lombok.Data
    public static class UpdateSellerProfileRequest {
        private String storeName;
        private String storeDescription;
    }
}


