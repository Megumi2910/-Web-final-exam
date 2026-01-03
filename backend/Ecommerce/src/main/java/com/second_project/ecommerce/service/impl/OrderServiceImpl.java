package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.*;
import com.second_project.ecommerce.model.CheckoutRequestDto;
import com.second_project.ecommerce.model.OrderDto;
import com.second_project.ecommerce.model.OrderItemDto;
import com.second_project.ecommerce.model.PaymentDto;
import com.second_project.ecommerce.repository.OrderRepository;
import com.second_project.ecommerce.repository.OrderItemRepository;
import com.second_project.ecommerce.repository.CartRepository;
import com.second_project.ecommerce.repository.PaymentRepository;
import com.second_project.ecommerce.service.OrderService;
import com.second_project.ecommerce.service.CartService;
import com.second_project.ecommerce.service.ProductService;
import org.springframework.data.domain.PageImpl;
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
    private final PaymentRepository paymentRepository;

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
            productService.decrementStock(product.getId(), cartItem.getQuantity());
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
                    productService.incrementStock(item.getProduct().getId(), item.getQuantity());
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
    public void cancelOrder(Long orderId, User user, String cancellationReason) {
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

        // Set cancellation reason (trim and validate)
        if (cancellationReason != null && !cancellationReason.trim().isEmpty()) {
            String trimmedReason = cancellationReason.trim();
            if (trimmedReason.length() > 500) {
                trimmedReason = trimmedReason.substring(0, 500);
            }
            order.setCancellationReason(trimmedReason);
            log.debug("Setting cancellation reason on order {}: {}", orderId, trimmedReason);
        } else {
            log.debug("No cancellation reason provided for order {}", orderId);
        }

        // Update order status to CANCELLED
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        // Restore product stock when cancelling
        for (OrderItem item : order.getItems()) {
            productService.incrementStock(item.getProduct().getId(), item.getQuantity());
        }

        // Save the order with cancellation reason and status
        Order savedOrder = orderRepository.save(order);
        // Explicitly flush to ensure the change is persisted immediately
        orderRepository.flush();
        log.info("Order {} cancelled by user {} with reason: {} (status changed from {} to CANCELLED). Saved cancellation reason: {}", 
                orderId, user.getUserId(), 
                cancellationReason != null ? cancellationReason : "No reason provided",
                oldStatus,
                savedOrder.getCancellationReason());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findOrdersBySeller(User seller) {
        return orderRepository.findOrdersBySeller(seller);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderService.OrderStatistics getUserOrderStatistics(User user) {
        OrderService.OrderStatistics stats = new OrderService.OrderStatistics();
        stats.setTotalCount(orderRepository.countByUserId(user.getUserId()));
        stats.setPendingCount(orderRepository.countByUserIdAndOrderStatus(user.getUserId(), Order.OrderStatus.PENDING));
        stats.setShippingCount(orderRepository.countByUserIdAndOrderStatus(user.getUserId(), Order.OrderStatus.PROCESSING));
        stats.setCompletedCount(orderRepository.countByUserIdAndOrderStatus(user.getUserId(), Order.OrderStatus.COMPLETED));
        stats.setCancelledCount(orderRepository.countByUserIdAndOrderStatus(user.getUserId(), Order.OrderStatus.CANCELLED));
        return stats;
    }

    @Override
    public Order createOrderFromCart(User user, CheckoutRequestDto checkoutRequest) {
        log.info("Creating order from cart for user {}", user.getUserId());
        
        // Get user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for user: " + user.getUserId()));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Validate payment method
        Payment.PaymentMethod paymentMethod;
        try {
            paymentMethod = Payment.PaymentMethod.valueOf(checkoutRequest.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment method: " + checkoutRequest.getPaymentMethod());
        }

        // Validate stock and calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal shippingFee = BigDecimal.valueOf(30000); // Default shipping fee
        BigDecimal discount = BigDecimal.ZERO;
        
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            
            // Check if product is approved
            if (product.getStatus() != Product.ProductStatus.APPROVED) {
                throw new IllegalArgumentException("Product is not available: " + product.getName());
            }
            
            // Check stock
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                    String.format("Insufficient stock for '%s'. Available: %d, Requested: %d",
                                 product.getName(),
                                 product.getStock(),
                                 cartItem.getQuantity()));
            }
            
            subtotal = subtotal.add(cartItem.getTotalPrice());
        }
        
        BigDecimal totalAmount = subtotal.add(shippingFee).subtract(discount);

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setDiscount(discount);
        order.setTotalAmount(totalAmount);
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setDeliveryStatus(Order.DeliveryStatus.PENDING);
        order.setShippingAddress(checkoutRequest.getShippingAddress());
        order.setPhoneNumber(checkoutRequest.getPhoneNumber());
        order.setNotes(checkoutRequest.getNotes());
        order.setOrderDate(LocalDateTime.now());

        // Create order items and update stock
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getUnitPrice()); // Use setPrice() which is the actual field
            orderItem.setProductVariant(cartItem.getProductVariant());
            orderItem.setCreatedAt(LocalDateTime.now());
            orderItem.setUpdatedAt(LocalDateTime.now());
            order.addItem(orderItem);

            // Update stock
            productService.decrementStock(product.getId(), cartItem.getQuantity());
        }

        // Save order (cascades to order items)
        Order savedOrder = orderRepository.save(order);

        // Create payment
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
        payment.setAmount(totalAmount);
        payment.setTransactionId(generateTransactionCode());
        savedOrder.setPayment(payment);
        paymentRepository.save(payment);

        // Note: Cart is NOT cleared - items remain in cart for potential future orders
        // (Following book_store pattern)

        log.info("Order created successfully: orderId={}, totalAmount={}", 
                 savedOrder.getId(), totalAmount);

        return savedOrder;
    }

    /**
     * Generate a transaction code for payment.
     * In production, this should integrate with payment gateway.
     */
    private String generateTransactionCode() {
        return "TXN" + String.format("%08d", System.currentTimeMillis() % 100000000);
    }

    // DTO methods for REST API (best practice to avoid lazy loading and circular reference issues)
    @Override
    public OrderDto createOrderFromCartDto(User user, CheckoutRequestDto checkoutRequest) {
        Order order = createOrderFromCart(user, checkoutRequest);
        return convertToDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderDtoById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return convertToDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> findByUserDto(User user, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findByUserOrderByOrderDateDesc(user, pageable);
        List<OrderDto> dtos = orderPage.getContent().stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
        return new PageImpl<>(dtos, pageable, orderPage.getTotalElements());
    }

    /**
     * Convert Order entity to OrderDto.
     * BEST PRACTICE: Convert entities to DTOs within @Transactional method
     * to ensure all lazy-loaded relationships are fetched before session closes.
     */
    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setSubtotal(order.getSubtotal());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscount(order.getDiscount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setDeliveryStatus(order.getDeliveryStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setNotes(order.getNotes());
        String cancellationReason = order.getCancellationReason();
        dto.setCancellationReason(cancellationReason);
        log.debug("Converting order {} to DTO. Cancellation reason: {}", order.getId(), cancellationReason);
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setOrderDate(order.getOrderDate());
        dto.setDeliveredDate(order.getDeliveredDate());

        // Flatten user information (lazy-loaded relationship)
        if (order.getUser() != null) {
            User user = order.getUser();
            dto.setUserId(user.getUserId());
            dto.setUserName(user.getFirstName() + " " + user.getLastName());
            dto.setUserEmail(user.getEmail());
        }

        // Convert order items to DTOs
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItemDto> itemDtos = order.getItems().stream()
                    .map(this::convertItemToDto)
                    .collect(java.util.stream.Collectors.toList());
            dto.setItems(itemDtos);
        }

        // Convert payment to DTO (flatten circular reference)
        if (order.getPayment() != null) {
            Payment payment = order.getPayment();
            PaymentDto paymentDto = new PaymentDto();
            paymentDto.setId(payment.getId());
            paymentDto.setOrderId(order.getId());
            paymentDto.setAmount(payment.getAmount());
            paymentDto.setPaymentMethod(payment.getPaymentMethod());
            paymentDto.setPaymentStatus(payment.getPaymentStatus());
            paymentDto.setTransactionId(payment.getTransactionId());
            paymentDto.setNotes(payment.getNotes());
            paymentDto.setCreatedAt(payment.getCreatedAt());
            paymentDto.setUpdatedAt(payment.getUpdatedAt());
            paymentDto.setPaidAt(payment.getPaidAt());
            dto.setPayment(paymentDto);
        }

        return dto;
    }

    /**
     * Convert OrderItem entity to OrderItemDto.
     * Flattens lazy-loaded relationships to avoid serialization issues.
     */
    private OrderItemDto convertItemToDto(OrderItem item) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getPrice());
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
            }
        }

        return dto;
    }
}


