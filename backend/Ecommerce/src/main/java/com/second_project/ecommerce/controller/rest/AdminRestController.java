package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.PageResponse;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminRestController {

    private final ProductService productService;
    private final UserService userService;

    // Product Management
    @GetMapping("/products/pending")
    public ResponseEntity<PageResponse<Product>> getPendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productService.findPendingProducts(pageable);

        return ResponseEntity.ok(PageResponse.success(
                "Pending products retrieved successfully",
                productPage.getContent(),
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        ));
    }

    @PutMapping("/products/{id}/approve")
    public ResponseEntity<ApiResponse<Product>> approveProduct(@PathVariable Long id) {
        Product product = productService.approveProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product approved successfully", product));
    }

    @PutMapping("/products/{id}/reject")
    public ResponseEntity<ApiResponse<Product>> rejectProduct(
            @PathVariable Long id,
            @RequestBody RejectProductRequest request) {

        Product product = productService.rejectProduct(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Product rejected successfully", product));
    }

    // User Management
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {

        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setRole(User.UserRole.valueOf(request.getRole()));
        
        // If promoting to SELLER, set approval status
        if (user.getRole() == User.UserRole.SELLER) {
            user.setIsSellerApproved(true);
        }

        User updatedUser = userService.save(user);
        log.info("User {} role updated to {}", id, request.getRole());

        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updatedUser));
    }

    @PutMapping("/users/{id}/seller-status")
    public ResponseEntity<ApiResponse<User>> updateSellerStatus(
            @PathVariable Long id,
            @RequestBody UpdateSellerStatusRequest request) {

        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != User.UserRole.SELLER) {
            throw new IllegalArgumentException("User is not a seller");
        }

        user.setIsSellerApproved(request.getIsApproved());
        User updatedUser = userService.save(user);
        log.info("Seller {} approval status updated to {}", id, request.getIsApproved());

        return ResponseEntity.ok(ApiResponse.success("Seller status updated successfully", updatedUser));
    }

    @Data
    public static class RejectProductRequest {
        private String reason;
    }

    @Data
    public static class UpdateRoleRequest {
        private String role;
    }

    @Data
    public static class UpdateSellerStatusRequest {
        private Boolean isApproved;
    }
}


