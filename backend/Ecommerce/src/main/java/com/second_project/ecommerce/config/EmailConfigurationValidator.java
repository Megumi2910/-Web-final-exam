package com.second_project.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * Validates email configuration on application startup.
 * 
 * This class checks if email settings are properly configured.
 * If email is not configured, it logs a warning but doesn't prevent application startup.
 * This allows the application to run even if email is not configured (useful for development).
 */
@Configuration
@Slf4j
public class EmailConfigurationValidator {

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @PostConstruct
    public void validateEmailConfiguration() {
        boolean isConfigured = mailUsername != null && !mailUsername.trim().isEmpty()
                && mailPassword != null && !mailPassword.trim().isEmpty();

        if (!isConfigured) {
            log.warn("================================================");
            log.warn("EMAIL CONFIGURATION WARNING");
            log.warn("================================================");
            log.warn("Email service is not properly configured.");
            log.warn("MAIL_USERNAME and/or MAIL_PASSWORD environment variables are missing or empty.");
            log.warn("Email verification and password reset features will not work.");
            log.warn("To configure email, set the following environment variables:");
            log.warn("  - MAIL_USERNAME=your-email@gmail.com");
            log.warn("  - MAIL_PASSWORD=your-app-password");
            log.warn("  - MAIL_HOST=smtp.gmail.com (optional, default: smtp.gmail.com)");
            log.warn("  - MAIL_PORT=587 (optional, default: 587)");
            log.warn("================================================");
        } else {
            log.info("Email configuration validated successfully. Mail host: {}", mailHost);
            // Test connection (optional - can be enabled if needed)
            // try {
            //     javaMailSender.testConnection();
            //     log.info("Email connection test successful");
            // } catch (Exception e) {
            //     log.warn("Email connection test failed: {}", e.getMessage());
            // }
        }
    }
}

