package com.second_project.ecommerce.service;

public interface EmailService {
    void sendVerificationEmail(String toEmail, String subject, String body);
}

