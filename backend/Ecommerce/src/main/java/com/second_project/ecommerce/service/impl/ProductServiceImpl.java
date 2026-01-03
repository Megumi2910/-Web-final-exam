package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.Product;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.ProductDto;
import com.second_project.ecommerce.repository.ProductRepository;
import com.second_project.ecommerce.repository.ReviewRepository;
import com.second_project.ecommerce.service.CategoryService;
import com.second_project.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final CategoryService categoryService;
    private final com.second_project.ecommerce.service.UserService userService;

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
        if (product.getId() == null) {
            product.setCreatedAt(LocalDateTime.now());
            // Only set status to PENDING for new products if status is not already set
            if (product.getStatus() == null) {
                product.setStatus(Product.ProductStatus.PENDING);
            }
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

    // DTO methods
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> findAllDtos(Pageable pageable) {
        try {
            Page<Product> productPage = productRepository.findAll(pageable);
            List<ProductDto> dtos = productPage.getContent().stream()
                    .map(this::convertToDtoSafe)
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
        } catch (Exception e) {
            log.error("Error in findAllDtos: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve products: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> findByStatusDtos(Product.ProductStatus status, Pageable pageable) {
        Page<Product> productPage = productRepository.findByStatus(status, pageable);
        List<ProductDto> dtos = productPage.getContent().stream()
                .map(this::convertToDtoSafe)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> searchProductsDtos(String keyword, Pageable pageable) {
        Page<Product> productPage = productRepository.findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(keyword, keyword, pageable);
        List<ProductDto> dtos = productPage.getContent().stream()
                .map(this::convertToDtoSafe)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductDto> findDtoById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductDto> findDtoBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> findFeaturedProductsDtos() {
        List<Product> products = productRepository.findByIsFeaturedTrueAndStatusOrderByCreatedAtDesc(Product.ProductStatus.APPROVED);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> findFeaturedProductsDtos(int limit) {
        List<Product> products = productRepository.findByIsFeaturedTrueAndStatusOrderByCreatedAtDesc(Product.ProductStatus.APPROVED);
        return products.stream()
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> findNewProductsDtos() {
        List<Product> products = productRepository.findByIsNewTrueAndStatusOrderByCreatedAtDesc(Product.ProductStatus.APPROVED);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> findNewProductsDtos(int limit) {
        List<Product> products = productRepository.findByIsNewTrueAndStatusOrderByCreatedAtDesc(Product.ProductStatus.APPROVED);
        return products.stream()
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> findHotProductsDtos(int limit) {
        List<Product> products = productRepository.findByIsHotTrueAndStatus(Product.ProductStatus.APPROVED, PageRequest.of(0, limit))
                .stream()
                .sorted((p1, p2) -> Integer.compare(p2.getSoldCount(), p1.getSoldCount()))
                .collect(Collectors.toList());
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> findByCategoryIdDtos(Long categoryId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByCategoryIdAndStatus(categoryId, Product.ProductStatus.APPROVED, pageable);
        List<ProductDto> dtos = productPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> findPendingProductsDtos(Pageable pageable) {
        Page<Product> productPage = productRepository.findByStatus(Product.ProductStatus.PENDING, pageable);
        List<ProductDto> dtos = productPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    @Override
    public ProductDto saveDto(ProductDto productDto) {
        Product product = convertToEntity(productDto);
        
        // Set seller if sellerId is provided
        if (productDto.getSellerId() != null) {
            User seller = userService.findById(productDto.getSellerId())
                    .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + productDto.getSellerId()));
            product.setSeller(seller);
        }
        
        Product savedProduct = save(product);
        return convertToDto(savedProduct);
    }

    @Override
    public ProductDto updateDto(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Update fields
        product.setName(productDto.getName());
        product.setSlug(productDto.getSlug());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setOriginalPrice(productDto.getOriginalPrice());
        product.setStock(productDto.getStock());
        product.setImages(productDto.getImages());
        product.setBrand(productDto.getBrand());
        product.setIsFeatured(productDto.getIsFeatured());
        product.setIsHot(productDto.getIsHot());
        product.setIsNew(productDto.getIsNew());
        
        // Preserve status - only update if explicitly provided and user has permission
        // Admin can change status, but we preserve it if not provided to prevent accidental reverts
        if (productDto.getStatus() != null) {
            product.setStatus(productDto.getStatus());
        }
        // If status is not provided in DTO, keep the existing status (important for approval persistence)
        
        product.setUpdatedAt(LocalDateTime.now());

        // Update categories if provided
        if (productDto.getCategoryIds() != null && !productDto.getCategoryIds().isEmpty()) {
            Set<com.second_project.ecommerce.entity.Category> categories = productDto.getCategoryIds().stream()
                    .map(categoryId -> categoryService.findById(categoryId)
                            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId)))
                    .collect(Collectors.toSet());
            product.setCategories(categories);
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDto(updatedProduct);
    }

    @Override
    public ProductDto approveProductDto(Long id) {
        Product product = approveProduct(id);
        return convertToDto(product);
    }

    @Override
    public ProductDto rejectProductDto(Long id, String reason) {
        Product product = rejectProduct(id, reason);
        return convertToDto(product);
    }

    /**
     * Convert Product entity to ProductDto safely without accessing lazy-loaded relationships.
     * Uses separate queries to fetch seller and category information.
     */
    private ProductDto convertToDtoSafe(Product product) {
        if (product == null) {
            log.warn("Attempted to convert null product to DTO");
            return null;
        }

        try {
            ProductDto dto = new ProductDto();
            dto.setId(product.getId());
            dto.setName(product.getName());
            dto.setBrand(product.getBrand());
            dto.setSku(product.getSku());
            dto.setSlug(product.getSlug());
            dto.setDescription(product.getDescription());
            dto.setPrice(product.getPrice());
            dto.setOriginalPrice(product.getOriginalPrice());
            dto.setStock(product.getStock() != null ? product.getStock() : 0);
            dto.setSoldCount(product.getSoldCount() != null ? product.getSoldCount() : 0);
            dto.setImages(product.getImages() != null ? product.getImages() : new java.util.ArrayList<>());
            dto.setIsFeatured(product.getIsFeatured() != null ? product.getIsFeatured() : false);
            dto.setIsHot(product.getIsHot() != null ? product.getIsHot() : false);
            dto.setIsNew(product.getIsNew() != null ? product.getIsNew() : false);
            dto.setStatus(product.getStatus() != null ? product.getStatus() : Product.ProductStatus.PENDING);
            dto.setCreatedAt(product.getCreatedAt());
            dto.setUpdatedAt(product.getUpdatedAt());

            // Fetch seller information using separate query to avoid lazy loading
            Long productId = product.getId();
            if (productId != null) {
                try {
                    Long sellerId = productRepository.findSellerIdByProductId(productId);
                    if (sellerId != null) {
                        dto.setSellerId(sellerId);
                        Optional<User> sellerOpt = userService.findById(sellerId);
                        if (sellerOpt.isPresent()) {
                            User seller = sellerOpt.get();
                            String firstName = seller.getFirstName() != null ? seller.getFirstName() : "";
                            String lastName = seller.getLastName() != null ? seller.getLastName() : "";
                            dto.setSellerName((firstName + " " + lastName).trim());
                            dto.setSellerEmail(seller.getEmail() != null ? seller.getEmail() : "");
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to load seller for product {}: {}", productId, e.getMessage());
                    // Continue without seller info - this is not critical
                }

                // Fetch category IDs using separate query
                try {
                    List<Long> categoryIds = productRepository.findCategoryIdsByProductId(productId);
                    if (categoryIds != null && !categoryIds.isEmpty()) {
                        dto.setCategoryIds(new java.util.HashSet<>(categoryIds));
                    }
                } catch (Exception e) {
                    log.warn("Failed to load categories for product {}: {}", productId, e.getMessage());
                    // Continue without category info
                }

                // Set review statistics
                try {
                    Long reviewCount = reviewRepository.countByProductId(productId);
                    dto.setReviewCount(reviewCount != null ? reviewCount : 0L);
                    Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
                    dto.setRating(avgRating != null ? avgRating : null);
                } catch (Exception e) {
                    log.warn("Failed to load review statistics for product {}: {}", productId, e.getMessage());
                    dto.setReviewCount(0L);
                    dto.setRating(null);
                }
            }

            return dto;
        } catch (Exception e) {
            log.error("Error converting product {} to DTO: {}", product.getId(), e.getMessage(), e);
            // Return a minimal DTO with basic info to prevent complete failure
            ProductDto dto = new ProductDto();
            dto.setId(product.getId());
            dto.setName(product.getName() != null ? product.getName() : "Unknown Product");
            dto.setStatus(product.getStatus() != null ? product.getStatus() : Product.ProductStatus.PENDING);
            return dto;
        }
    }

    /**
     * Convert Product entity to ProductDto.
     * BEST PRACTICE: Use mapper libraries like MapStruct in production for complex mappings.
     */
    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setSku(product.getSku());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setStock(product.getStock());
        dto.setSoldCount(product.getSoldCount());
        dto.setImages(product.getImages());
        dto.setIsFeatured(product.getIsFeatured());
        dto.setIsHot(product.getIsHot());
        dto.setIsNew(product.getIsNew());
        dto.setStatus(product.getStatus());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        // Set seller information (flatten lazy-loaded relationship)
        try {
            if (product.getSeller() != null) {
                User seller = product.getSeller();
                dto.setSellerId(seller.getUserId());
                dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
                dto.setSellerEmail(seller.getEmail());
            }
        } catch (Exception e) {
            log.warn("Failed to load seller for product {}: {}", product.getId(), e.getMessage());
            // Seller info will remain null
        }

        // Set category IDs (flatten lazy-loaded relationship)
        try {
            if (product.getCategories() != null && !product.getCategories().isEmpty()) {
                Set<Long> categoryIds = product.getCategories().stream()
                        .map(com.second_project.ecommerce.entity.Category::getId)
                        .collect(Collectors.toSet());
                dto.setCategoryIds(categoryIds);
            }
        } catch (Exception e) {
            log.warn("Failed to load categories for product {}: {}", product.getId(), e.getMessage());
            // Category IDs will remain null
        }

        // Set review statistics
        Long productId = product.getId();
        dto.setReviewCount(reviewRepository.countByProductId(productId));
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        dto.setRating(avgRating != null ? avgRating : null);

        return dto;
    }

    /**
     * Convert ProductDto to Product entity.
     */
    private Product convertToEntity(ProductDto dto) {
        Product product = new Product();
        if (dto.getId() != null) {
            product.setId(dto.getId());
        }
        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setSku(dto.getSku());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setStock(dto.getStock() != null ? dto.getStock() : 0);
        product.setSoldCount(dto.getSoldCount() != null ? dto.getSoldCount() : 0);
        product.setImages(dto.getImages());
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsHot(dto.getIsHot() != null ? dto.getIsHot() : false);
        product.setIsNew(dto.getIsNew() != null ? dto.getIsNew() : false);
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : Product.ProductStatus.PENDING);

        // Set seller if provided
        if (dto.getSellerId() != null) {
            // Note: This assumes UserService is available, otherwise seller should be set separately
            // For now, we'll skip setting seller in conversion - it should be set by the service layer
        }

        // Set categories if provided
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            Set<com.second_project.ecommerce.entity.Category> categories = dto.getCategoryIds().stream()
                    .map(categoryId -> categoryService.findById(categoryId)
                            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId)))
                    .collect(Collectors.toSet());
            product.setCategories(categories);
        }

        return product;
    }
}

