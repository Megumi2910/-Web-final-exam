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
    
    Optional<User> findByPhoneNumber(String phoneNumber);
    
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
    
    /**
     * Searches users by email, first name, or last name containing the given keyword
     * (case-insensitive).
     *
     * @param emailKeyword     Keyword for email
     * @param firstNameKeyword Keyword for first name
     * @param lastNameKeyword  Keyword for last name
     * @param pageable         Pagination information
     * @return Page of users matching the keyword
     */
    Page<User> findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String emailKeyword, String firstNameKeyword, String lastNameKeyword, Pageable pageable);
}

