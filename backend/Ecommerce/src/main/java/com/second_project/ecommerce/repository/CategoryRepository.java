package com.second_project.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByName(String name);
    
    Optional<Category> findBySlug(String slug);
    
    List<Category> findByIsActive(boolean isActive);
    
    List<Category> findByIsActiveTrue();
    
    List<Category> findAllByOrderByDisplayOrderAsc();
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
}

