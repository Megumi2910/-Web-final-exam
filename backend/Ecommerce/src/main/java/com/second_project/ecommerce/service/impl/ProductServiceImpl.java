package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.repository.ProductRepository;
import com.second_project.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Product> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable) {
        return productRepository.findByStatus(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(keyword, keyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findBySlug(String slug) {
        return productRepository.findBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> findBySeller(User seller, Pageable pageable) {
        return productRepository.findBySeller(seller, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndStatusOrderByCreatedAtDesc(Product.ProductStatus.APPROVED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> findNewProducts() {
        return productRepository.findByIsNewTrueAndStatusOrderByCreatedAtDesc(Product.ProductStatus.APPROVED);
    }

    @Override
    public Product save(Product product) {
        if (product.getProductId() == null) {
            product.setCreatedAt(LocalDateTime.now());
            product.setStatus(Product.ProductStatus.PENDING);
        }
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    @Override
    public Product update(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setName(productDetails.getName());
        product.setSlug(productDetails.getSlug());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setOriginalPrice(productDetails.getOriginalPrice());
        product.setStock(productDetails.getStock());
        product.setImages(productDetails.getImages());
        product.setBrand(productDetails.getBrand());
        product.setCategories(productDetails.getCategories());
        product.setUpdatedAt(LocalDateTime.now());

        return productRepository.save(product);
    }

    @Override
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        productRepository.delete(product);
        log.info("Product deleted: {}", id);
    }

    @Override
    public Product approveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setStatus(Product.ProductStatus.APPROVED);
        product.setUpdatedAt(LocalDateTime.now());
        Product savedProduct = productRepository.save(product);
        log.info("Product approved: {}", id);
        return savedProduct;
    }

    @Override
    public Product rejectProduct(Long id, String reason) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setStatus(Product.ProductStatus.REJECTED);
        product.setUpdatedAt(LocalDateTime.now());
        // TODO: Store rejection reason and notify seller
        Product savedProduct = productRepository.save(product);
        log.info("Product rejected: {} - Reason: {}", id, reason);
        return savedProduct;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> findPendingProducts(Pageable pageable) {
        return productRepository.findByStatus(Product.ProductStatus.PENDING, pageable);
    }

    @Override
    public void incrementStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setStock(product.getStock() + quantity);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    @Override
    public void decrementStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        product.setStock(product.getStock() - quantity);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }
}

