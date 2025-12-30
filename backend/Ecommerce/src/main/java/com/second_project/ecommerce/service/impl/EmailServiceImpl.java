package com.second_project.ecommerce.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.second_project.ecommerce.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final JavaMailSender javaMailSender;

    @Override
    public void sendVerificationEmail(String toEmail, String subject, String body) {
        try {
            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                log.error("Email not configured: spring.mail.username is not set. Please set MAIL_USERNAME environment variable.");
                throw new RuntimeException("Email service not configured. Please set MAIL_USERNAME and MAIL_PASSWORD environment variables.");
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            javaMailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to: {}. Error: {}", toEmail, e.getMessage(), e);
            if (e.getMessage() != null && e.getMessage().contains("not configured")) {
                throw e; // Re-throw configuration errors
            }
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

