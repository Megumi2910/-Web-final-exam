package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.Order;
import com.second_project.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order createOrder(User user, String shippingAddress, String shippingPhone);
    Order updateOrderStatus(Long orderId, Order.OrderStatus status);
    Optional<Order> findById(Long id);
    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findAll(Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    void cancelOrder(Long orderId, User user);
    List<Order> findOrdersBySeller(User seller);
}


