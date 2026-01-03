package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.Cart;
import com.second_project.ecommerce.entity.CartItem;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.CartDto;

import java.util.Optional;

public interface CartService {
    Cart getOrCreateCart(User user);
    Cart addItem(User user, Long productId, Integer quantity);
    Cart addOrReplaceItem(User user, Long productId, Integer quantity);
    Cart updateItemQuantity(User user, Long cartItemId, Integer quantity);
    Cart removeItem(User user, Long cartItemId);
    void clearCart(User user);
    Optional<Cart> findByUser(User user);
    CartItem findCartItem(Long cartItemId);
    
    // DTO methods for REST API (best practice to avoid lazy loading issues)
    CartDto getCartDto(User user);
    CartDto addItemDto(User user, Long productId, Integer quantity);
    CartDto addOrReplaceItemDto(User user, Long productId, Integer quantity);
    CartDto updateItemQuantityDto(User user, Long cartItemId, Integer quantity);
    CartDto removeItemDto(User user, Long cartItemId);
}


