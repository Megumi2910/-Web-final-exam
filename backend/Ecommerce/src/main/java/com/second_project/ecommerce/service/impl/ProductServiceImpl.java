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
    private final com.second_project.ecommerce.repository.CartItemRepository cartItemRepository;
    private final com.second_project.ecommerce.repository.OrderItemRepository orderItemRepository;

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
    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        
        // Check for order items (historical data - we should preserve these)
        boolean hasOrderItems = product.getOrderItems() != null && !product.getOrderItems().isEmpty();
        
        // Remove cart items (these are not historical, safe to delete)
        try {
            int cartItemsRemoved = cartItemRepository.findByProductId(id).size();
            if (cartItemsRemoved > 0) {
                cartItemRepository.deleteByProductId(id);
                log.info("Removed {} cart items for product {}", cartItemsRemoved, id);
            }
        } catch (Exception e) {
            log.warn("Failed to remove cart items for product {}: {}", id, e.getMessage());
        }
        
        // Soft delete: Mark product as DISCONTINUED instead of hard delete
        // This preserves data integrity for order history while removing product from active listings
        product.setStatus(Product.ProductStatus.DISCONTINUED);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
        
        if (hasOrderItems) {
            log.info("Product {} marked as DISCONTINUED (has {} order items - preserved for history)", 
                    id, product.getOrderItems().size());
        } else {
            log.info("Product {} marked as DISCONTINUED", id);
        }
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
        // Decrement soldCount when stock is restored (order cancelled)
        if (product.getSoldCount() != null && product.getSoldCount() >= quantity) {
            product.setSoldCount(product.getSoldCount() - quantity);
        }
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
        // Increment soldCount when stock is decremented (order created)
        product.setSoldCount((product.getSoldCount() != null ? product.getSoldCount() : 0) + quantity);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    // DTO methods
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> findAllDtos(Pageable pageable) {
        try {
            // Include all products including DISCONTINUED (admin should see all)
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
        // Only show APPROVED products in public search (exclude DISCONTINUED, PENDING, REJECTED, OUT_OF_STOCK)
        Page<Product> productPage = productRepository.searchByKeyword(keyword, Product.ProductStatus.APPROVED, pageable);
        List<ProductDto> dtos = productPage.getContent().stream()
                .map(this::convertToDtoSafe)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductDto> findDtoById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDtoSafe);
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
        // Get new products based on creation date (within 30 days), not isNew flag
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Product> products = productRepository.findByStatus(Product.ProductStatus.APPROVED, PageRequest.of(0, 1000))
                .stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(thirtyDaysAgo))
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> findHotProductsDtos(int limit) {
        // Get hot products based on soldCount (buy counts), not isHot flag
        List<Product> products = productRepository.findByStatus(Product.ProductStatus.APPROVED, PageRequest.of(0, 1000))
                .stream()
                .sorted((p1, p2) -> Integer.compare(p2.getSoldCount(), p1.getSoldCount()))
                .limit(limit)
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
    public Page<ProductDto> findBySellerIdDtos(Long sellerId, Pageable pageable) {
        // Show only APPROVED products for public shop page
        log.debug("Fetching products for sellerId: {} with status: APPROVED", sellerId);
        
        Page<Product> productPage = productRepository.findBySellerIdAndStatus(sellerId, Product.ProductStatus.APPROVED, pageable);
        
        // If no products found, check if there are any products with this sellerId but different status
        // This helps debug the issue
        if (productPage.getTotalElements() == 0) {
            log.warn("No APPROVED products found for sellerId: {}. Checking all products for this seller...", sellerId);
            
            // Check using native query to see actual seller_id values
            try {
                Long productId = 2L; // The product ID from the image
                Long actualSellerId = productRepository.findSellerIdByProductId(productId);
                log.warn("Product ID 2 has seller_id: {}, but we're looking for sellerId: {}", actualSellerId, sellerId);
            } catch (Exception e) {
                log.warn("Could not check product seller_id: {}", e.getMessage());
            }
            
            Page<Product> allProducts = productRepository.findBySellerIdExcludingDiscontinued(sellerId, pageable);
            if (allProducts.getTotalElements() > 0) {
                log.warn("Found {} products for sellerId {} but none are APPROVED. Statuses: {}", 
                    allProducts.getTotalElements(), sellerId,
                    allProducts.getContent().stream()
                        .map(p -> p.getStatus().name())
                        .collect(Collectors.toSet()));
                
                // Also log the product IDs and their seller IDs for debugging
                allProducts.getContent().forEach(p -> {
                    try {
                        Long productSellerId = p.getSeller() != null ? p.getSeller().getUserId() : null;
                        Long dbSellerId = productRepository.findSellerIdByProductId(p.getId());
                        log.warn("Product ID: {}, Name: {}, Status: {}, Seller.userId: {}, DB seller_id: {}, Expected SellerId: {}", 
                            p.getId(), p.getName(), p.getStatus(), productSellerId, dbSellerId, sellerId);
                    } catch (Exception e) {
                        log.warn("Could not get seller info for product {}: {}", p.getId(), e.getMessage());
                    }
                });
            } else {
                log.warn("No products found at all for sellerId: {}. Checking if seller exists...", sellerId);
            }
        } else {
            log.debug("Found {} APPROVED products for sellerId: {}", productPage.getTotalElements(), sellerId);
        }
        
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
    @Transactional(rollbackFor = Exception.class)
    public ProductDto saveDto(ProductDto productDto) {
        Product product = convertToEntity(productDto);
        
        // Set seller if sellerId is provided
        if (productDto.getSellerId() != null) {
            User seller = userService.findById(productDto.getSellerId())
                    .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + productDto.getSellerId()));
            product.setSeller(seller);
        }
        
        Product savedProduct = save(product);
        productRepository.flush(); // Ensure changes are persisted before DTO conversion
        // Use convertToDtoSafe to avoid lazy loading issues with Category.products
        return convertToDtoSafe(savedProduct);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductDto updateDto(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Update fields
        if (productDto.getName() != null) {
            product.setName(productDto.getName());
        }
        if (productDto.getSlug() != null && !productDto.getSlug().isEmpty()) {
            product.setSlug(productDto.getSlug());
        }
        if (productDto.getDescription() != null) {
            product.setDescription(productDto.getDescription());
        }
        if (productDto.getPrice() != null) {
            product.setPrice(productDto.getPrice());
        }
        if (productDto.getOriginalPrice() != null) {
            product.setOriginalPrice(productDto.getOriginalPrice());
        }
        if (productDto.getStock() != null) {
            product.setStock(productDto.getStock());
        }
        if (productDto.getImages() != null) {
            product.setImages(productDto.getImages());
        }
        if (productDto.getBrand() != null) {
            product.setBrand(productDto.getBrand());
        }
        if (productDto.getIsFeatured() != null) {
            product.setIsFeatured(productDto.getIsFeatured());
        }
        if (productDto.getIsHot() != null) {
            product.setIsHot(productDto.getIsHot());
        }
        if (productDto.getIsNew() != null) {
            product.setIsNew(productDto.getIsNew());
        }
        
        // Update status if provided in DTO
        // Admin can change status including DISCONTINUED
        if (productDto.getStatus() != null) {
            log.debug("Updating product {} status from {} to {}", id, product.getStatus(), productDto.getStatus());
            product.setStatus(productDto.getStatus());
        } else {
            log.debug("Product {} status not provided in DTO, keeping existing status: {}", id, product.getStatus());
        }
        
        product.setUpdatedAt(LocalDateTime.now());

        // Update categories if provided
        if (productDto.getCategoryIds() != null && !productDto.getCategoryIds().isEmpty()) {
            // Load categories into a list first to avoid ConcurrentModificationException
            // when collecting to Set (which calls hashCode that may trigger lazy loading)
            List<com.second_project.ecommerce.entity.Category> categoryList = productDto.getCategoryIds().stream()
                    .map(categoryId -> categoryService.findById(categoryId)
                            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId)))
                    .collect(Collectors.toList());
            // Convert to Set after all categories are loaded
            Set<com.second_project.ecommerce.entity.Category> categories = new java.util.HashSet<>(categoryList);
            product.setCategories(categories);
        }

        Product updatedProduct = productRepository.save(product);
        // Flush to ensure all changes are persisted before converting to DTO
        productRepository.flush();
        // Use convertToDtoSafe to avoid lazy loading issues with Category.products
        // All lazy-loaded relationships should be accessed within this transaction
        return convertToDtoSafe(updatedProduct);
    }

    @Override
    public ProductDto approveProductDto(Long id) {
        Product product = approveProduct(id);
        // Use convertToDtoSafe to avoid lazy loading issues with Category.products
        return convertToDtoSafe(product);
    }

    @Override
    public ProductDto rejectProductDto(Long id, String reason) {
        Product product = rejectProduct(id, reason);
        // Use convertToDtoSafe to avoid lazy loading issues with Category.products
        return convertToDtoSafe(product);
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
            // Calculate soldCount from order items if product's soldCount is 0 or null
            Integer soldCount = product.getSoldCount() != null ? product.getSoldCount() : 0;
            if (soldCount == 0 && product.getId() != null) {
                try {
                    Integer calculatedSoldCount = orderItemRepository.sumQuantityByProductId(product.getId());
                    if (calculatedSoldCount != null && calculatedSoldCount > 0) {
                        soldCount = calculatedSoldCount;
                        // Update the product's soldCount for future queries (but don't save here to avoid nested transaction issues)
                        product.setSoldCount(calculatedSoldCount);
                    }
                } catch (Exception e) {
                    log.warn("Failed to calculate soldCount from order items for product {}: {}", product.getId(), e.getMessage());
                }
            }
            dto.setSoldCount(soldCount);
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
                            // Use store name if available, otherwise use seller's full name
                            String sellerName = seller.getStoreName() != null && !seller.getStoreName().trim().isEmpty()
                                ? seller.getStoreName()
                                : ((seller.getFirstName() != null ? seller.getFirstName() : "") + " " + (seller.getLastName() != null ? seller.getLastName() : "")).trim();
                            dto.setSellerName(sellerName);
                            dto.setSellerEmail(seller.getEmail() != null ? seller.getEmail() : "");
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to load seller for product {}: {}", productId, e.getMessage());
                    // Continue without seller info - this is not critical
                }

                // Fetch category IDs and populate categories list
                try {
                    List<Long> categoryIds = productRepository.findCategoryIdsByProductId(productId);
                    if (categoryIds != null && !categoryIds.isEmpty()) {
                        // Create a new HashSet to avoid any concurrent modification issues during serialization
                        dto.setCategoryIds(new java.util.HashSet<>(categoryIds));
                        
                        // Populate categories list with CategoryDto objects for frontend use
                        List<com.second_project.ecommerce.model.CategoryDto> categoryDtos = categoryIds.stream()
                                .map(categoryId -> {
                                    try {
                                        return categoryService.findDtoById(categoryId);
                                    } catch (Exception e) {
                                        log.warn("Failed to load category {} for product {}: {}", categoryId, productId, e.getMessage());
                                        return null;
                                    }
                                })
                                .filter(cat -> cat != null)
                                .collect(Collectors.toList());
                        dto.setCategories(categoryDtos);
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
                // Use store name if available, otherwise use seller's full name
                String sellerName = seller.getStoreName() != null && !seller.getStoreName().trim().isEmpty()
                    ? seller.getStoreName()
                    : (seller.getFirstName() + " " + seller.getLastName()).trim();
                dto.setSellerName(sellerName);
                dto.setSellerEmail(seller.getEmail());
            }
        } catch (Exception e) {
            log.warn("Failed to load seller for product {}: {}", product.getId(), e.getMessage());
            // Seller info will remain null
        }

        // Set category IDs (flatten lazy-loaded relationship)
        // NOTE: This method is deprecated in favor of convertToDtoSafe, but kept for backward compatibility
        try {
            if (product.getCategories() != null && !product.getCategories().isEmpty()) {
                // Create a new HashSet to avoid any concurrent modification issues during serialization
                // Copy to ArrayList first to avoid concurrent modification during stream processing
                java.util.List<com.second_project.ecommerce.entity.Category> categoryList = 
                    new java.util.ArrayList<>(product.getCategories());
                Set<Long> categoryIds = categoryList.stream()
                        .map(com.second_project.ecommerce.entity.Category::getId)
                        .collect(Collectors.toCollection(java.util.HashSet::new));
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
            // Load categories into a list first to avoid ConcurrentModificationException
            // when collecting to Set (which calls hashCode that may trigger lazy loading)
            List<com.second_project.ecommerce.entity.Category> categoryList = dto.getCategoryIds().stream()
                    .map(categoryId -> categoryService.findById(categoryId)
                            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId)))
                    .collect(Collectors.toList());
            // Convert to Set after all categories are loaded
            Set<com.second_project.ecommerce.entity.Category> categories = new java.util.HashSet<>(categoryList);
            product.setCategories(categories);
        }

        return product;
    }
}

