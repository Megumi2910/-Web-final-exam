package com.second_project.ecommerce.controller.rest;

import com.second_project.ecommerce.entity.Order;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ApiResponse;
import com.second_project.ecommerce.model.CheckoutRequestDto;
import com.second_project.ecommerce.model.OrderDto;
import com.second_project.ecommerce.model.PageResponse;
import com.second_project.ecommerce.security.CustomUserDetails;
import com.second_project.ecommerce.service.OrderService;
import com.second_project.ecommerce.service.UserService;
import jakarta.validation.Valid;
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

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderRestController {

    private final OrderService orderService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CreateOrderRequest request) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Order order = orderService.createOrder(user, request.getShippingAddress(), request.getShippingPhone());
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CheckoutRequestDto checkoutRequest) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Unverified users cannot checkout (same as guests)
        if (!user.getIsVerified()) {
            throw new IllegalArgumentException("Please verify your email to place orders");
        }

        OrderDto orderDto = orderService.createOrderFromCartDto(user, checkoutRequest);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", orderDto));
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderDto>> getUserOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDto> orderPage = orderService.findByUserDto(user, pageable);

        return ResponseEntity.ok(PageResponse.success(
                "Orders retrieved successfully",
                orderPage.getContent(),
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        OrderDto orderDto = orderService.getOrderDtoById(id);

        // Verify order belongs to user (or user is admin)
        if (!orderDto.getUserId().equals(user.getUserId()) && 
            user.getRole() != User.UserRole.ADMIN) {
            throw new IllegalArgumentException("Access denied");
        }

        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", orderDto));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest request) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String cancellationReason = request != null ? request.getCancellationReason() : null;
        log.info("Received cancel order request for order {} with reason: {}", id, cancellationReason);
        orderService.cancelOrder(id, user, cancellationReason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderService.findAll(pageable);

        return ResponseEntity.ok(PageResponse.success(
                "Orders retrieved successfully",
                orderPage.getContent(),
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        ));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {

        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<OrderService.OrderStatistics>> getOrderStatistics(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        OrderService.OrderStatistics stats = orderService.getUserOrderStatistics(user);
        return ResponseEntity.ok(ApiResponse.success("Order statistics retrieved successfully", stats));
    }

    @GetMapping("/dashboard-statistics")
    public ResponseEntity<ApiResponse<OrderService.DashboardStatistics>> getDashboardStatistics(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        OrderService.DashboardStatistics stats = orderService.getDashboardStatistics(user);
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }

    @Data
    public static class CreateOrderRequest {
        private String shippingAddress;
        private String shippingPhone;
    }

    @Data
    public static class CancelOrderRequest {
        private String cancellationReason;
    }
}


