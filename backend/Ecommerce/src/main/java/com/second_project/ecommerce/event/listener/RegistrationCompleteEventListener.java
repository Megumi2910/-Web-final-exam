package com.second_project.ecommerce.event.listener;

import org.springframework.context.ApplicationListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.second_project.ecommerce.config.properties.FrontendProperties;
import com.second_project.ecommerce.config.properties.TokenProperties;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.entity.VerificationToken;
import com.second_project.ecommerce.event.RegistrationCompleteEvent;
import com.second_project.ecommerce.repository.VerificationTokenRepository;
import com.second_project.ecommerce.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

/**
 * Event listener for user registration completion.
 * Creates a verification token and sends an email verification link.
 * 
 * FLOW WITH REACT FRONTEND:
 * - Email link points to frontend: http://localhost:3000/verify-email?token=xxx
 * - Frontend calls backend API to verify the token
 * 
 * Note: Email URL is configured via FrontendProperties (application.yml).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RegistrationCompleteEventListener implements ApplicationListener<RegistrationCompleteEvent> {

    private final EmailService emailService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final FrontendProperties frontendProperties;
    private final TokenProperties tokenProperties;
    
    // GMT+7 timezone for consistent date/time handling
    private static final ZoneId GMT_PLUS_7 = ZoneId.of("GMT+7");

    /**
     * Handle registration complete event asynchronously.
     * 
     * This runs in a separate thread pool so the HTTP request returns immediately
     * without waiting for email to be sent.
     * 
     * @param event The registration complete event
     */
    @Async
    @Override
    public void onApplicationEvent(RegistrationCompleteEvent event) {
        try {
            // Get the user from the event
            User user = event.getUser();
            
            // Delete existing verification tokens for this user
            verificationTokenRepository.deleteByUser(user.getUserId());
            
            // Get current time in GMT+7 timezone
            LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
            
            // Create new verification token
            VerificationToken token = new VerificationToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setExpiryDate(now.plusMinutes(tokenProperties.getVerificationDurationMinutes()));
            token.setCreatedAt(now);
            verificationTokenRepository.save(token);
            
            // Create verification URL using configured frontend base URL
            String frontendBaseUrl = frontendProperties.getBaseUrl();
            String verificationUrl = frontendBaseUrl + "/verify-email?token=" + token.getToken();

            // Create email information
            String toEmail = user.getEmail();
            String subject = "Xác thực tài khoản - Verify Account";
            String body = "Xin chào " + user.getFirstName() + ",\n\n"
                        + "Cảm ơn bạn đã đăng ký! Vui lòng nhấp vào liên kết sau để xác thực tài khoản của bạn:\n"
                        + "Thank you for registering! Please click the following link to verify your account:\n\n"
                        + verificationUrl
                        + "\n\nLiên kết sẽ hết hạn sau " + tokenProperties.getVerificationDurationMinutes() + " phút.\n"
                        + "The link will expire in " + tokenProperties.getVerificationDurationMinutes() + " minutes."
                        + "\n\nNếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.\n"
                        + "If you did not create this account, please ignore this email."
                        + "\n\nTrân trọng,\nBest regards,\nEcommerce Team";

            // Send verification email
            emailService.sendVerificationEmail(toEmail, subject, body);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending verification email", e);
            // Don't throw exception - event listener should not break the main flow
        }
    }
}

