package com.second_project.ecommerce.service.impl;

import com.second_project.ecommerce.config.properties.FrontendProperties;
import com.second_project.ecommerce.config.properties.TokenProperties;
import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.entity.VerificationToken;
import com.second_project.ecommerce.entity.ResetPasswordToken;
import com.second_project.ecommerce.event.RegistrationCompleteEvent;
import com.second_project.ecommerce.model.auth.RegisterRequest;
import com.second_project.ecommerce.model.auth.LoginRequest;
import com.second_project.ecommerce.model.auth.AuthResponse;
import com.second_project.ecommerce.model.auth.UserInfo;
import com.second_project.ecommerce.repository.UserRepository;
import com.second_project.ecommerce.repository.VerificationTokenRepository;
import com.second_project.ecommerce.repository.ResetPasswordTokenRepository;
import com.second_project.ecommerce.security.JwtTokenProvider;
import com.second_project.ecommerce.service.EmailService;
import com.second_project.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final ResetPasswordTokenRepository resetPasswordTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final ApplicationEventPublisher eventPublisher;
    private final TokenProperties tokenProperties;
    private final EmailService emailService;
    private final FrontendProperties frontendProperties;
    
    // GMT+7 timezone for consistent date/time handling
    private static final ZoneId GMT_PLUS_7 = ZoneId.of("GMT+7");

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Check if phone number already exists
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(User.UserRole.CUSTOMER);
        user.setIsVerified(false);
        LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User savedUser = userRepository.save(user);

        // Publish event - listener will handle token creation and email sending
        eventPublisher.publishEvent(new RegistrationCompleteEvent(savedUser));
        log.info("User registered successfully: {}", savedUser.getEmail());

        // Generate JWT token with all user details
        String token = jwtTokenProvider.generateTokenFromEmail(
                savedUser.getEmail(),
                savedUser.getUserId(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserInfo(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getEmail());

        // Authenticate user - throws exception if credentials are invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // Generate JWT token with all user details
        String token = jwtTokenProvider.generateTokenFromEmail(
                user.getEmail(),
                user.getUserId(),
                user.getRole().name()
        );

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserInfo(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User save(User user) {
        user.setUpdatedAt(LocalDateTime.now(GMT_PLUS_7));
        return userRepository.save(user);
    }

    @Override
    public void verifyUser(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
        if (verificationToken.getExpiryDate().isBefore(now)) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setIsVerified(true);
        user.setUpdatedAt(now);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
        log.info("User verified successfully: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void requestVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        
        // Check if user is already verified
        if (user.getIsVerified()) {
            throw new IllegalArgumentException("User is already verified!");
        }
        
        // Rate limiting: Check if email was sent recently
        LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
        if (user.getLastVerificationEmailSent() != null) {
            long secondsSinceLastEmail = ChronoUnit.SECONDS.between(
                user.getLastVerificationEmailSent(), now);
            
            long rateLimitSeconds = tokenProperties.getRateLimitSeconds();
            if (secondsSinceLastEmail < rateLimitSeconds) {
                long secondsRemaining = rateLimitSeconds - secondsSinceLastEmail;
                throw new IllegalArgumentException(
                    "Please wait before requesting another verification email. Try again in " 
                    + secondsRemaining + " seconds.");
            }
        }
        
        // Update last sent timestamp
        user.setLastVerificationEmailSent(now);
        userRepository.save(user);
        
        // Publish event - existing listener will handle token creation and email sending
        eventPublisher.publishEvent(new RegistrationCompleteEvent(user));
        log.info("Verification email requested for: {}", email);
    }

    @Override
    @Transactional
    public void resendVerificationEmailSynchronously(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        
        // Check if user is already verified
        if (user.getIsVerified()) {
            throw new IllegalArgumentException("User is already verified!");
        }
        
        // Rate limiting: Check if email was sent recently
        LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
        if (user.getLastVerificationEmailSent() != null) {
            long secondsSinceLastEmail = ChronoUnit.SECONDS.between(
                user.getLastVerificationEmailSent(), now);
            
            long rateLimitSeconds = tokenProperties.getRateLimitSeconds();
            if (secondsSinceLastEmail < rateLimitSeconds) {
                long secondsRemaining = rateLimitSeconds - secondsSinceLastEmail;
                throw new IllegalArgumentException(
                    "Please wait before requesting another verification email. Try again in " 
                    + secondsRemaining + " seconds.");
            }
        }
        
        // Delete existing verification tokens for this user
        verificationTokenRepository.deleteByUser(user.getUserId());
        
        // Create new verification token
        VerificationToken token = new VerificationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiryDate(now.plusMinutes(tokenProperties.getVerificationDurationMinutes()));
        token.setCreatedAt(now);
        verificationTokenRepository.save(token);
        
        // Update last sent timestamp
        user.setLastVerificationEmailSent(now);
        userRepository.save(user);
        
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

        // Send verification email synchronously - this will throw exception if it fails
        emailService.sendVerificationEmail(toEmail, subject, body);
        log.info("Verification email sent synchronously to: {}", email);
    }

    @Override
    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Delete existing tokens
        resetPasswordTokenRepository.deleteByUser(user);

        // Create new token
        LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
        ResetPasswordToken resetToken = new ResetPasswordToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setUser(user);
        resetToken.setExpiryDate(now.plusHours(1));
        resetToken.setCreatedAt(now);
        resetPasswordTokenRepository.save(resetToken);

        // TODO: Send password reset email
        log.info("Password reset token created for user: {}", email);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        ResetPasswordToken resetToken = resetPasswordTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        LocalDateTime now = LocalDateTime.now(GMT_PLUS_7);
        if (resetToken.getExpiryDate().isBefore(now)) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(now);
        userRepository.save(user);

        resetPasswordTokenRepository.delete(resetToken);
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return userRepository.findAll(pageable);
        }

        String trimmed = keyword.trim();
        return userRepository
                .findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        trimmed, trimmed, trimmed, pageable);
    }

    private UserInfo mapToUserInfo(User user) {
        return UserInfo.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isVerified(user.getIsVerified())
                .isSellerApproved(user.getIsSellerApproved())
                .storeName(user.getStoreName())
                .build();
    }
}


