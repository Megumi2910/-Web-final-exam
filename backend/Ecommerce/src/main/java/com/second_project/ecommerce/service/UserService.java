package com.second_project.ecommerce.service;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.model.auth.AuthResponse;
import com.second_project.ecommerce.model.auth.LoginRequest;
import com.second_project.ecommerce.model.auth.RegisterRequest;

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
    void createPasswordResetToken(String email);
    void resetPassword(String token, String newPassword);
}

