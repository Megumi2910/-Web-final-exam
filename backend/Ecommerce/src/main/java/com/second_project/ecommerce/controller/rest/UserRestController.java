package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.auth.UserInfo;
import com.second_project.ecommerce.repository.UserRepository;
import com.second_project.ecommerce.security.CustomUserDetails;
import com.second_project.ecommerce.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserRestController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserInfo>> getUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserInfo userInfo = UserInfo.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole().name())
                .isVerified(user.getIsVerified())
                .isSellerApproved(user.getIsSellerApproved())
                .storeName(user.getStoreName())
                .storeAddress(user.getStoreAddress())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userInfo));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserInfo>> updateUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // Update phone number if provided
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            String newPhoneNumber = request.getPhoneNumber().trim();
            // Validate Vietnamese phone number format
            if (!newPhoneNumber.matches("^(0|\\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$")) {
                throw new IllegalArgumentException("Phone number must be a valid Vietnamese phone number (e.g., 0912345678 or +84912345678)");
            }
            
            // Only update if phone number is different from current
            if (!newPhoneNumber.equals(user.getPhoneNumber())) {
                String oldPhoneNumber = user.getPhoneNumber();
                // Check if phone number is already taken by another user
                userRepository.findByPhoneNumber(newPhoneNumber)
                        .ifPresent(existingUser -> {
                            if (!existingUser.getUserId().equals(user.getUserId())) {
                                throw new IllegalArgumentException("Phone number is already registered to another account");
                            }
                        });
                
                user.setPhoneNumber(newPhoneNumber);
                log.info("Phone number updated for user {} from {} to {}", user.getUserId(), oldPhoneNumber, newPhoneNumber);
            }
        }

        // Allow email update only for unverified users
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (user.getIsVerified()) {
                throw new IllegalArgumentException("Email cannot be changed for verified users");
            }
            
            String newEmail = request.getEmail().trim().toLowerCase();
            // Check if email is already taken by another user
            userService.findByEmail(newEmail)
                    .ifPresent(existingUser -> {
                        if (!existingUser.getUserId().equals(user.getUserId())) {
                            throw new IllegalArgumentException("Email is already registered to another account");
                        }
                    });
            
            user.setEmail(newEmail);
            // Reset verification status when email is changed
            user.setIsVerified(false);
            log.info("Email updated for unverified user {}, verification status reset", user.getUserId());
        }

        User updatedUser = userService.save(user);
        log.info("User profile updated for user {}", user.getUserId());

        UserInfo userInfo = UserInfo.builder()
                .userId(updatedUser.getUserId())
                .firstName(updatedUser.getFirstName())
                .lastName(updatedUser.getLastName())
                .email(updatedUser.getEmail())
                .phoneNumber(updatedUser.getPhoneNumber())
                .address(updatedUser.getAddress())
                .role(updatedUser.getRole().name())
                .isVerified(updatedUser.getIsVerified())
                .isSellerApproved(updatedUser.getIsSellerApproved())
                .storeName(updatedUser.getStoreName())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", userInfo));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Check if new password is the same as current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.save(user);
        log.info("Password changed for user {}", user.getUserId());

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        userService.verifyUser(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    // Public endpoint to get seller/shop information
    @GetMapping("/{id}/shop")
    public ResponseEntity<ApiResponse<UserInfo>> getShopInfo(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserInfo userInfo = UserInfo.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole().name())
                .isVerified(user.getIsVerified())
                .isSellerApproved(user.getIsSellerApproved())
                .storeName(user.getStoreName())
                .storeDescription(user.getStoreDescription())
                .storeAddress(user.getStoreAddress())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Shop information retrieved successfully", userInfo));
    }

    @Data
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private String email; // Only allowed for unverified users
        private String address;
    }

    @Data
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }
}


