package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.entity.Category;
import com.second_project.ecommerce.model.CategoryDto;
import com.second_project.ecommerce.repository.CategoryRepository;
import com.second_project.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Category> findAll(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> findActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Category> findBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    @Override
    public Category save(Category category) {
        if (category.getCategoryId() == null) {
            category.setCreatedAt(LocalDateTime.now());
        }
        category.setUpdatedAt(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    @Override
    public Category update(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setDescription(categoryDetails.getDescription());
        category.setImage(categoryDetails.getImage());
        category.setIsActive(categoryDetails.getIsActive());
        category.setUpdatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    @Override
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }

    @Override
    public void updateProductCount(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        int productCount = category.getProducts() != null ? category.getProducts().size() : 0;
        category.setProductCount(productCount);
        category.setUpdatedAt(LocalDateTime.now());
        categoryRepository.save(category);
    }

    // DTO methods for API responses
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> findAllDtos() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> findActiveCategoriesDtos() {
        List<Category> categories = categoryRepository.findByIsActiveTrue();
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto findDtoById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        return convertToDto(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto findDtoBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        return convertToDto(category);
    }

    @Override
    @Transactional
    public CategoryDto saveDto(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setSlug(categoryDto.getSlug());
        category.setDescription(categoryDto.getDescription());
        category.setImageUrl(categoryDto.getImageUrl());
        category.setIsActive(categoryDto.getIsActive() != null ? categoryDto.getIsActive() : true);
        category.setDisplayOrder(categoryDto.getDisplayOrder() != null ? categoryDto.getDisplayOrder() : 0);
        
        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    @Override
    @Transactional
    public CategoryDto updateDto(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setName(categoryDto.getName());
        if (categoryDto.getSlug() != null) {
            category.setSlug(categoryDto.getSlug());
        }
        category.setDescription(categoryDto.getDescription());
        category.setImageUrl(categoryDto.getImageUrl());
        if (categoryDto.getIsActive() != null) {
            category.setIsActive(categoryDto.getIsActive());
        }
        if (categoryDto.getDisplayOrder() != null) {
            category.setDisplayOrder(categoryDto.getDisplayOrder());
        }
        category.setUpdatedAt(LocalDateTime.now());

        Category updatedCategory = categoryRepository.save(category);
        return convertToDto(updatedCategory);
    }

    /**
     * Convert Category entity to CategoryDto.
     * 
     * BEST PRACTICE: Use mapper libraries like MapStruct in production
     * for complex mappings.
     */
    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        dto.setIsActive(category.getIsActive());
        dto.setDisplayOrder(category.getDisplayOrder());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        
        // Count products efficiently using repository query
        Long productCount = categoryRepository.countProductsByCategoryId(category.getId());
        dto.setProductCount(productCount != null ? productCount.intValue() : 0);
        
        return dto;
    }
}


