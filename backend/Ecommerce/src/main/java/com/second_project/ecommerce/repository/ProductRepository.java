package com.second_project.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.Product.ProductStatus;
import com.second_project.ecommerce.entity.User;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findBySku(String sku);
    
    Optional<Product> findBySlug(String slug);
    
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    
    Page<Product> findBySeller(User seller, Pageable pageable);
    
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);
    
    Page<Product> findByStatusAndSellerId(ProductStatus status, Long sellerId, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.seller.userId = :sellerId AND p.status = :status")
    Page<Product> findBySellerIdAndStatus(@Param("sellerId") Long sellerId, 
                                          @Param("status") ProductStatus status, 
                                          Pageable pageable);
    
    Page<Product> findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(
        String name, String brand, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, 
                                  @Param("status") ProductStatus status, 
                                  Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN p.categories c WHERE c.id = :categoryId AND p.status = :status")
    Page<Product> findByCategoryIdAndStatus(@Param("categoryId") Long categoryId, 
                                            @Param("status") ProductStatus status, 
                                            Pageable pageable);
    
    List<Product> findByIsFeaturedTrueAndStatus(ProductStatus status, Pageable pageable);
    
    List<Product> findByIsFeaturedTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);
    
    List<Product> findByIsNewTrueAndStatus(ProductStatus status, Pageable pageable);
    
    List<Product> findByIsNewTrueAndStatusOrderByCreatedAtDesc(ProductStatus status);
    
    List<Product> findByIsHotTrueAndStatus(ProductStatus status, Pageable pageable);
    
    long countByStatus(ProductStatus status);
    
    long countBySellerId(Long sellerId);
    
    // Query to get seller ID for a product (using native query to avoid lazy loading)
    @Query(value = "SELECT seller_id FROM products WHERE id = :productId", nativeQuery = true)
    Long findSellerIdByProductId(@Param("productId") Long productId);
    
    // Query to get category IDs for a product
    @Query("SELECT c.id FROM Product p JOIN p.categories c WHERE p.id = :productId")
    List<Long> findCategoryIdsByProductId(@Param("productId") Long productId);
    
    @Query("SELECT p FROM Product p WHERE p.seller.userId = :sellerId ORDER BY p.soldCount DESC")
    Page<Product> findTopSellingProductsBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);
}

