package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.Cart;
import com.second_project.ecommerce.entity.CartItem;
import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.repository.CartRepository;
import com.second_project.ecommerce.repository.CartItemRepository;
import com.second_project.ecommerce.repository.ProductRepository;
import com.second_project.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setItems(new ArrayList<>());
            cart.setTotalAmount(BigDecimal.ZERO);
            cart.setCreatedAt(LocalDateTime.now());
            cart.setUpdatedAt(LocalDateTime.now());
            return cartRepository.save(cart);
        });
    }

    @Override
    public Cart addItem(User user, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Check if product is approved
        if (product.getStatus() != Product.ProductStatus.APPROVED) {
            throw new IllegalArgumentException("Product is not available");
        }

        // Check stock
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;

            if (product.getStock() < newQuantity) {
                throw new IllegalArgumentException("Insufficient stock");
            }

            item.setQuantity(newQuantity);
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(newQuantity)));
            item.setUpdatedAt(LocalDateTime.now());
            cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setUnitPrice(product.getPrice());
            cartItem.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
            cartItem.setCreatedAt(LocalDateTime.now());
            cartItem.setUpdatedAt(LocalDateTime.now());
            cartItemRepository.save(cartItem);
            cart.getItems().add(cartItem);
        }

        updateCartTotal(cart);
        log.info("Added product {} to cart for user {}", productId, user.getUserId());
        return cart;
    }

    @Override
    public Cart updateItemQuantity(User user, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new IllegalArgumentException("Cart item does not belong to user");
        }

        // Check stock
        if (cartItem.getProduct().getStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        cartItem.setQuantity(quantity);
        cartItem.setTotalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(quantity)));
        cartItem.setUpdatedAt(LocalDateTime.now());
        cartItemRepository.save(cartItem);

        updateCartTotal(cart);
        log.info("Updated cart item {} quantity to {}", cartItemId, quantity);
        return cart;
    }

    @Override
    public Cart removeItem(User user, Long cartItemId) {
        Cart cart = getOrCreateCart(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new IllegalArgumentException("Cart item does not belong to user");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        updateCartTotal(cart);
        log.info("Removed cart item {} from cart", cartItemId);
        return cart;
    }

    @Override
    public void clearCart(User user) {
        Optional<Cart> cartOptional = cartRepository.findByUser(user);
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cart.setTotalAmount(BigDecimal.ZERO);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
            log.info("Cleared cart for user {}", user.getUserId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Cart> findByUser(User user) {
        return cartRepository.findByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public CartItem findCartItem(Long cartItemId) {
        return cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
    }

    private void updateCartTotal(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalAmount(total);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }
}


