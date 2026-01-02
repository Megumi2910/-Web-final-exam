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
    
    @jakarta.annotation.PostConstruct
    public void init() {
        // Diagnostic logging to identify configuration source
        String envVar = System.getenv("MAIL_USERNAME");
        String sysProp = System.getProperty("MAIL_USERNAME");
        
        log.info("================================================");
        log.info("EmailServiceImpl INITIALIZATION");
        log.info("================================================");
        log.info("System.getenv('MAIL_USERNAME'): {}", envVar != null ? envVar : "NOT SET");
        log.info("System.getProperty('MAIL_USERNAME'): {}", sysProp != null ? sysProp : "NOT SET");
        log.info("@Value('spring.mail.username') resolved to: {}", fromEmail);
        log.info("================================================");
        
        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            log.error("CRITICAL: fromEmail is NULL or EMPTY! Email service will not work.");
        } else if (fromEmail.contains("quangminhh29190")) {
            log.error("CRITICAL: Using OLD email address: {}. Expected: minhnq29190@gmail.com", fromEmail);
            log.error("This indicates environment variable MAIL_USERNAME is not being read correctly.");
        }
    }

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

            log.info("Sending email from: {} to: {} with subject: {}", fromEmail, toEmail, subject);
            javaMailSender.send(message);
            log.info("Email sent successfully from: {} to: {}", fromEmail, toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to: {}. Error: {}", toEmail, e.getMessage(), e);
            if (e.getMessage() != null && e.getMessage().contains("not configured")) {
                throw e; // Re-throw configuration errors
            }
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

