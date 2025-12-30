package com.second_project.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.Cart;
import com.second_project.ecommerce.entity.User;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    Optional<Cart> findByUserId(Long userId);
    
    Optional<Cart> findByUser(User user);
    
    boolean existsByUserId(Long userId);
}

