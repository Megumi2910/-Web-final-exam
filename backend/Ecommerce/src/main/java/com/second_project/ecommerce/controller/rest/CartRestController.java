package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.CartDto;
import com.second_project.ecommerce.security.CustomUserDetails;
import com.second_project.ecommerce.service.CartService;
import com.second_project.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartRestController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Unverified users cannot access cart (same as guests)
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email to access cart");
        }

        CartDto cartDto = cartService.getCartDto(user);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cartDto));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItemToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Unverified users cannot add to cart (same as guests)
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email to add items to cart");
        }

        CartDto cartDto = cartService.addItemDto(user, productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", cartDto));
    }

    @PostMapping("/buy-now")
    public ResponseEntity<ApiResponse<CartDto>> buyNow(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Add or replace item in cart (replace if exists, don't increment)
        CartDto cartDto = cartService.addOrReplaceItemDto(user, productId, quantity);
        
        // Return cart with success message indicating buy now action
        return ResponseEntity.ok(ApiResponse.success("Item added to cart. Redirecting to checkout...", cartDto));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Unverified users cannot update cart (same as guests)
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email to update cart");
        }

        CartDto cartDto = cartService.updateItemQuantityDto(user, cartItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", cartDto));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long cartItemId) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Unverified users cannot remove from cart (same as guests)
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email to modify cart");
        }

        CartDto cartDto = cartService.removeItemDto(user, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Cart item removed successfully", cartDto));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        cartService.clearCart(user);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Integer>> getCartItemCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Unverified users return 0 cart count (same as guests)
        if (!user.getIsVerified()) {
            return ResponseEntity.ok(ApiResponse.success("Cart item count retrieved successfully", 0));
        }

        CartDto cartDto = cartService.getCartDto(user);
        // Return count of unique products (different items), not total quantity
        int itemCount = (cartDto.getItems() != null) ? cartDto.getItems().size() : 0;
        return ResponseEntity.ok(ApiResponse.success("Cart item count retrieved successfully", itemCount));
    }
}


