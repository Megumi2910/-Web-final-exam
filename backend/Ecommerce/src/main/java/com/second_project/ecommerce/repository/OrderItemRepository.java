package com.second_project.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.OrderItem;
import com.second_project.ecommerce.entity.Order.OrderStatus;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Sum quantities of order items for a product (excluding cancelled orders)
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product.id = :productId AND oi.order.orderStatus != 'CANCELLED'")
    Integer sumQuantityByProductId(@Param("productId") Long productId);
    
    List<OrderItem> findByProductId(Long productId);
    
    // Check if user has purchased a product (for verified purchase badge)
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.product.id = :productId AND oi.order.user.userId = :userId AND oi.order.orderStatus = :status")
    boolean existsByProductIdAndOrderUserIdAndOrderStatus(@Param("productId") Long productId, 
                                                          @Param("userId") Long userId, 
                                                          @Param("status") OrderStatus status);
}

