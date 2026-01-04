package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.Cart;
import com.second_project.ecommerce.entity.CartItem;
import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.CartDto;
import com.second_project.ecommerce.model.CartItemDto;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setItems(new ArrayList<>());
            newCart.setTotalAmount(BigDecimal.ZERO);
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setUpdatedAt(LocalDateTime.now());
            return cartRepository.save(newCart);
        });
        
        // Eagerly fetch items and products to avoid lazy loading issues
        if (cart.getItems() != null) {
            cart.getItems().size(); // Trigger lazy loading
            cart.getItems().forEach(item -> {
                if (item.getProduct() != null) {
                    item.getProduct().getName(); // Trigger lazy loading for product
                    if (item.getProduct().getSeller() != null) {
                        item.getProduct().getSeller().getUserId(); // Trigger lazy loading for seller
                    }
                }
            });
        }
        
        return cart;
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
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Increment quantity (add to existing)
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
        log.info("Added product {} to cart for user {} (incremented quantity)", productId, user.getUserId());
        return cart;
    }

    @Override
    public Cart addOrReplaceItem(User user, Long productId, Integer quantity) {
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
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Replace quantity (don't increment)
            CartItem item = existingItem.get();
            item.setQuantity(quantity);
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
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
        log.info("Added or replaced product {} in cart for user {} (quantity: {})", productId, user.getUserId(), quantity);
        return cart;
    }

    @Override
    public Cart updateItemQuantity(User user, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
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
        if (!cartItem.getCart().getId().equals(cart.getId())) {
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

    // DTO methods for REST API (best practice to avoid lazy loading issues)
    @Override
    @Transactional(readOnly = true)
    public CartDto getCartDto(User user) {
        Cart cart = getOrCreateCart(user);
        return convertToDto(cart);
    }

    @Override
    public CartDto addItemDto(User user, Long productId, Integer quantity) {
        Cart cart = addItem(user, productId, quantity);
        return convertToDto(cart);
    }

    @Override
    public CartDto addOrReplaceItemDto(User user, Long productId, Integer quantity) {
        Cart cart = addOrReplaceItem(user, productId, quantity);
        return convertToDto(cart);
    }

    @Override
    public CartDto updateItemQuantityDto(User user, Long cartItemId, Integer quantity) {
        Cart cart = updateItemQuantity(user, cartItemId, quantity);
        return convertToDto(cart);
    }

    @Override
    public CartDto removeItemDto(User user, Long cartItemId) {
        Cart cart = removeItem(user, cartItemId);
        return convertToDto(cart);
    }

    /**
     * Convert Cart entity to CartDto.
     * BEST PRACTICE: Convert entities to DTOs within @Transactional method
     * to ensure all lazy-loaded relationships are fetched before session closes.
     */
    private CartDto convertToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser() != null ? cart.getUser().getUserId() : null);
        dto.setTotalAmount(cart.getTotalAmount());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        // Convert cart items to DTOs
        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            List<CartItemDto> itemDtos = cart.getItems().stream()
                    .map(this::convertItemToDto)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        } else {
            dto.setItems(new ArrayList<>());
        }

        dto.calculateTotals();
        return dto;
    }

    /**
     * Convert CartItem entity to CartItemDto.
     * Flattens lazy-loaded relationships to avoid serialization issues.
     */
    private CartItemDto convertItemToDto(CartItem item) {
        CartItemDto dto = new CartItemDto();
        dto.setId(item.getId());
        dto.setCartId(item.getCart() != null ? item.getCart().getId() : null);
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setProductVariant(item.getProductVariant());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());

        // Flatten product information (lazy-loaded relationship)
        if (item.getProduct() != null) {
            Product product = item.getProduct();
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setProductSlug(product.getSlug());
            dto.setProductPrice(product.getPrice());
            dto.setProductOriginalPrice(product.getOriginalPrice());
            dto.setProductStock(product.getStock());
            
            // Set product images
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                dto.setProductImages(product.getImages());
                dto.setProductImageUrl(product.getImages().get(0));
            }

            // Flatten seller information (lazy-loaded relationship)
            if (product.getSeller() != null) {
                User seller = product.getSeller();
                dto.setSellerId(seller.getUserId());
                dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
                // Use storeName if available, otherwise fallback to seller name
                dto.setStoreName(seller.getStoreName() != null && !seller.getStoreName().trim().isEmpty() 
                    ? seller.getStoreName() 
                    : seller.getFirstName() + " " + seller.getLastName());
            }
        }

        return dto;
    }
}


