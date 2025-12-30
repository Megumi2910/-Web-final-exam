package com.second_project.ecommerce.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_phone_number", columnNames = "phone_number"),
        @UniqueConstraint(name = "uk_user_email", columnNames = "email")
    }
)
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Version
    private Long version;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false, name = "phone_number")
    private String phoneNumber;

    private String address;
    
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private UserRole role = UserRole.CUSTOMER;
    
    @Column(nullable = false)
    @NotNull
    private Boolean isVerified = false;
    
    // For sellers: store name, description, etc.
    private String storeName;
    
    private String storeDescription;
    
    @Column(name = "is_seller_approved")
    private Boolean isSellerApproved = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "last_verification_email_sent")
    private LocalDateTime lastVerificationEmailSent;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();
    
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Product> products = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private VerificationToken verificationToken;

    public User(){}

    public User(Long userId, String firstName, String lastName, String email, String phoneNumber, String address, 
                String password, UserRole role, Boolean isVerified, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.password = password;
        this.role = role;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for bidirectional relationships
    public void setCart(Cart cart) {
        this.cart = cart;
        if (cart != null) {
            cart.setUser(this);
        }
    }

    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);
    }

    public void removeOrder(Order order) {
        orders.remove(order);
        order.setUser(null);
    }

    public void addReview(Review review) {
        reviews.add(review);
        review.setUser(this);
    }

    public void removeReview(Review review) {
        reviews.remove(review);
        review.setUser(null);
    }

    public void setVerificationToken(VerificationToken verificationToken) {
        this.verificationToken = verificationToken;
        if (verificationToken != null) {
            verificationToken.setUser(this);
        }
    }
    
    public void addProduct(Product product) {
        products.add(product);
        product.setSeller(this);
    }
    
    public void removeProduct(Product product) {
        products.remove(product);
        product.setSeller(null);
    }
    
    // Alias method for compatibility
    public Long getId() {
        return userId;
    }
    
    public void setId(Long id) {
        this.userId = id;
    }
    
    // For Spring Security UserDetails compatibility
    public boolean isEnabled() {
        return isVerified != null && isVerified;
    }

    public enum UserRole {
        ADMIN,      // Full system access
        SELLER,     // Can manage their own products and orders
        CUSTOMER    // Can browse, purchase, and review products
    }
}

