package com.second_project.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.entity.User.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailIgnoreCase(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    /**
     * Finds a user by role.
     *
     * @param role User role
     * @return Optional containing User if found
     */
    Optional<User> findByRole(UserRole role);
    
    Page<User> findByRole(UserRole role, Pageable pageable);
    
    Page<User> findByIsVerified(Boolean isVerified, Pageable pageable);
    
    long countByRole(UserRole role);
}

