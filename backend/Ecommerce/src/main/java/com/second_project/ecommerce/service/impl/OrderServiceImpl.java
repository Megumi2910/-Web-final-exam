package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.*;
import com.second_project.ecommerce.repository.OrderRepository;
import com.second_project.ecommerce.repository.OrderItemRepository;
import com.second_project.ecommerce.repository.CartRepository;
import com.second_project.ecommerce.service.OrderService;
import com.second_project.ecommerce.service.CartService;
import com.second_project.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final ProductService productService;

    @Override
    public Order createOrder(User user, String shippingAddress, String shippingPhone) {
        // Get user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalAmount(cart.getTotalAmount());
        order.setShippingAddress(shippingAddress);
        order.setShippingPhone(shippingPhone);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        Order savedOrder = orderRepository.save(order);

        // Create order items from cart items
        for (CartItem cartItem : cart.getItems()) {
            // Check stock availability
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setCreatedAt(LocalDateTime.now());
            orderItem.setUpdatedAt(LocalDateTime.now());
            orderItemRepository.save(orderItem);
            savedOrder.getItems().add(orderItem);

            // Decrease product stock
            productService.decrementStock(product.getProductId(), cartItem.getQuantity());
        }

        // Clear cart
        cartService.clearCart(user);

        log.info("Order created: {} for user: {}", savedOrder.getOrderId(), user.getUserId());
        return savedOrder;
    }

    @Override
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        // Handle status-specific logic
        switch (status) {
            case COMPLETED:
                order.setDeliveredDate(LocalDateTime.now());
                order.setDeliveryStatus(Order.DeliveryStatus.DELIVERED);
                break;
            case CANCELLED:
                // Restore product stock
                for (OrderItem item : order.getItems()) {
                    productService.incrementStock(item.getProduct().getProductId(), item.getQuantity());
                }
                break;
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Order {} status updated from {} to {}", orderId, oldStatus, status);
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findByUser(User user, Pageable pageable) {
        return orderRepository.findByUserOrderByOrderDateDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findAll(Pageable pageable) {
        return orderRepository.findAllByOrderByOrderDateDesc(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByOrderDateDesc(status, pageable);
    }

    @Override
    public void cancelOrder(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Verify order belongs to user
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("Order does not belong to user");
        }

        // Only allow cancellation for pending or processing orders
        if (order.getStatus() != Order.OrderStatus.PENDING && 
            order.getStatus() != Order.OrderStatus.PROCESSING) {
            throw new IllegalArgumentException("Order cannot be cancelled");
        }

        updateOrderStatus(orderId, Order.OrderStatus.CANCELLED);
        log.info("Order {} cancelled by user {}", orderId, user.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findOrdersBySeller(User seller) {
        return orderRepository.findOrdersBySeller(seller);
    }
}


