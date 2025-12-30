package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    Page<Product> findAll(Pageable pageable);
    Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable);
    Page<Product> searchProducts(String keyword, Pageable pageable);
    Optional<Product> findById(Long id);
    Optional<Product> findBySlug(String slug);
    Page<Product> findBySeller(User seller, Pageable pageable);
    List<Product> findFeaturedProducts();
    List<Product> findNewProducts();
    Product save(Product product);
    Product update(Long id, Product productDetails);
    void delete(Long id);
    Product approveProduct(Long id);
    Product rejectProduct(Long id, String reason);
    Page<Product> findPendingProducts(Pageable pageable);
    void incrementStock(Long productId, Integer quantity);
    void decrementStock(Long productId, Integer quantity);
}
