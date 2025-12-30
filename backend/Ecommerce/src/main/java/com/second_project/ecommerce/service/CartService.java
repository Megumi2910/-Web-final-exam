package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.Cart;
import com.second_project.ecommerce.entity.CartItem;
import com.second_project.ecommerce.entity.User;

import java.util.Optional;

public interface CartService {
    Cart getOrCreateCart(User user);
    Cart addItem(User user, Long productId, Integer quantity);
    Cart updateItemQuantity(User user, Long cartItemId, Integer quantity);
    Cart removeItem(User user, Long cartItemId);
    void clearCart(User user);
    Optional<Cart> findByUser(User user);
    CartItem findCartItem(Long cartItemId);
}


