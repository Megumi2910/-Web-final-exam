package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.Category;
import com.second_project.ecommerce.model.CategoryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    // Entity methods (for internal use)
    List<Category> findAll();
    Page<Category> findAll(Pageable pageable);
    List<Category> findActiveCategories();
    Optional<Category> findById(Long id);
    Optional<Category> findBySlug(String slug);
    Category save(Category category);
    Category update(Long id, Category categoryDetails);
    void delete(Long id);
    void updateProductCount(Long categoryId);
    
    // DTO methods (for API responses)
    List<CategoryDto> findAllDtos();
    List<CategoryDto> findActiveCategoriesDtos();
    CategoryDto findDtoById(Long id);
    CategoryDto findDtoBySlug(String slug);
    CategoryDto saveDto(CategoryDto categoryDto);
    CategoryDto updateDto(Long id, CategoryDto categoryDto);
}


