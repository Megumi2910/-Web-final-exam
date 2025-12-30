package com.second_project.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.Order;
import com.second_project.ecommerce.entity.Order.OrderStatus;
import com.second_project.ecommerce.entity.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    Page<Order> findByUser(User user, Pageable pageable);
    
    Page<Order> findByUserOrderByOrderDateDesc(User user, Pageable pageable);
    
    Page<Order> findByUserId(Long userId, Pageable pageable);
    
    Page<Order> findByOrderStatus(OrderStatus status, Pageable pageable);
    
    Page<Order> findByStatusOrderByOrderDateDesc(OrderStatus status, Pageable pageable);
    
    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);
    
    @Query("SELECT o FROM Order o JOIN o.items oi WHERE oi.product.seller.id = :sellerId")
    Page<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items oi WHERE oi.product.seller = :seller")
    List<Order> findOrdersBySeller(@Param("seller") User seller);
    
    long countByOrderStatus(OrderStatus status);
    
    long countByUserId(Long userId);
}

