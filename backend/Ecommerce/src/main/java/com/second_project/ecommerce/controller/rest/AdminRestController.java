package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.PageResponse;
import com.second_project.ecommerce.model.ProductDto;
import com.second_project.ecommerce.model.UserDto;
import com.second_project.ecommerce.service.ProductService;
import com.second_project.ecommerce.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminRestController {

    private final ProductService productService;
    private final UserService userService;

    // Product Management
    @GetMapping("/products")
    public ResponseEntity<PageResponse<ProductDto>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDto> productPage = productService.findAllDtos(pageable);

        return ResponseEntity.ok(PageResponse.success(
                "All products retrieved successfully",
                productPage.getContent(),
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        ));
    }

    @GetMapping("/products/pending")
    public ResponseEntity<PageResponse<ProductDto>> getPendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDto> productPage = productService.findPendingProductsDtos(pageable);

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
    public ResponseEntity<ApiResponse<ProductDto>> approveProduct(@PathVariable Long id) {
        ProductDto product = productService.approveProductDto(id);
        return ResponseEntity.ok(ApiResponse.success("Product approved successfully", product));
    }

    @PutMapping("/products/{id}/reject")
    public ResponseEntity<ApiResponse<ProductDto>> rejectProduct(
            @PathVariable Long id,
            @RequestBody RejectProductRequest request) {

        ProductDto product = productService.rejectProductDto(id, request.getReason());
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

    // User Management
    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userService.getAllUsers(pageable, keyword);
        
        // Convert User entities to UserDto
        List<UserDto> userDtos = userPage.getContent().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        
        Page<UserDto> userDtoPage = new PageImpl<>(userDtos, pageable, userPage.getTotalElements());

        return ResponseEntity.ok(PageResponse.success(
                "Users retrieved successfully",
                userDtoPage.getContent(),
                userDtoPage.getNumber(),
                userDtoPage.getSize(),
                userDtoPage.getTotalElements(),
                userDtoPage.getTotalPages()
        ));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update basic fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // Update role if provided
        if (request.getRole() != null) {
            try {
                User.UserRole newRole = User.UserRole.valueOf(request.getRole());
                
                // Prevent removing the last admin
                if (user.getRole() == User.UserRole.ADMIN && newRole != User.UserRole.ADMIN) {
                    long adminCount = userService.getAllUsers(PageRequest.of(0, Integer.MAX_VALUE), null)
                            .getContent().stream()
                            .filter(u -> u.getRole() == User.UserRole.ADMIN)
                            .count();
                    if (adminCount <= 1) {
                        throw new IllegalArgumentException("Cannot remove the last admin user");
                    }
                }
                
                user.setRole(newRole);
                
                // If promoting to SELLER, auto-approve
                if (newRole == User.UserRole.SELLER) {
                    user.setIsSellerApproved(true);
                } else if (newRole != User.UserRole.SELLER) {
                    // If demoting from SELLER, reset seller-specific fields
                    user.setIsSellerApproved(false);
                }
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + request.getRole());
            }
        }

        // Update verification status (enabled)
        if (request.getEnabled() != null) {
            user.setIsVerified(request.getEnabled());
        }

        // Update seller-specific fields
        if (request.getStoreName() != null) {
            user.setStoreName(request.getStoreName());
        }
        if (request.getStoreDescription() != null) {
            user.setStoreDescription(request.getStoreDescription());
        }
        if (request.getIsSellerApproved() != null && user.getRole() == User.UserRole.SELLER) {
            user.setIsSellerApproved(request.getIsSellerApproved());
        }

        User updatedUser = userService.save(user);
        log.info("User {} updated by admin", id);

        UserDto userDto = UserDto.fromEntity(updatedUser);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDto));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        UserDto userDto = UserDto.fromEntity(user);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userDto));
    }

    @Data
    public static class UpdateUserRequest {
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private String address;
        private String role;
        private Boolean enabled;
        private String storeName;
        private String storeDescription;
        private Boolean isSellerApproved;
    }
}


