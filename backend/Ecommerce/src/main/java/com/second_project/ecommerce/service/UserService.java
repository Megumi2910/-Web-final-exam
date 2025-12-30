package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.auth.AuthResponse;
import com.second_project.ecommerce.model.auth.LoginRequest;
import com.second_project.ecommerce.model.auth.RegisterRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    User getUserById(Long id);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    User save(User user);
    void verifyUser(String token);
    void requestVerificationEmail(String email);
    void resendVerificationEmailSynchronously(String email);
    void createPasswordResetToken(String email);
    void resetPassword(String token, String newPassword);
    
    /**
     * Get all users with optional keyword search.
     * Used for admin user management.
     * 
     * @param pageable Pagination information
     * @param keyword Optional search keyword (searches email, first name, last name)
     * @return Page of users
     */
    Page<User> getAllUsers(Pageable pageable, String keyword);
}

