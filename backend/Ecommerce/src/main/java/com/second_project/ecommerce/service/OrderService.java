package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.Order;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.CheckoutRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order createOrder(User user, String shippingAddress, String shippingPhone);
    Order createOrderFromCart(User user, CheckoutRequestDto checkoutRequest);
    Order updateOrderStatus(Long orderId, Order.OrderStatus status);
    com.second_project.ecommerce.model.OrderDto updateOrderStatusDto(Long orderId, Order.OrderStatus status);
    Optional<Order> findById(Long id);
    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findAll(Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    void cancelOrder(Long orderId, User user, String cancellationReason);
    List<Order> findOrdersBySeller(User seller);
    OrderStatistics getUserOrderStatistics(User user);
    
    // DTO methods for REST API (best practice to avoid lazy loading and circular reference issues)
    com.second_project.ecommerce.model.OrderDto createOrderFromCartDto(User user, CheckoutRequestDto checkoutRequest);
    com.second_project.ecommerce.model.OrderDto getOrderDtoById(Long id);
    Page<com.second_project.ecommerce.model.OrderDto> findByUserDto(User user, Pageable pageable);
    Page<com.second_project.ecommerce.model.OrderDto> findAllDto(Pageable pageable);
    
    DashboardStatistics getDashboardStatistics(User user);
    
    @lombok.Data
    class OrderStatistics {
        private Long totalCount;
        private Long pendingCount;
        private Long shippingCount;
        private Long completedCount;
        private Long cancelledCount;
    }
    
    @lombok.Data
    class DashboardStatistics {
        private java.math.BigDecimal totalSpending;
        private Long completedOrders;
        private Long cancelledOrders;
        private Double successRate;
        private java.util.List<String> addresses;
    }
}


