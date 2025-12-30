package com.second_project.ecommerce.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.security.token")
public class TokenProperties {

    private int verificationDurationMinutes = 10;
    private int resetPasswordDurationMinutes = 15;
    private long rateLimitSeconds = 60;

    public int getVerificationDurationMinutes() {
        return verificationDurationMinutes;
    }

    public void setVerificationDurationMinutes(int verificationDurationMinutes) {
        this.verificationDurationMinutes = verificationDurationMinutes;
    }

    public int getResetPasswordDurationMinutes() {
        return resetPasswordDurationMinutes;
    }

    public void setResetPasswordDurationMinutes(int resetPasswordDurationMinutes) {
        this.resetPasswordDurationMinutes = resetPasswordDurationMinutes;
    }

    public long getRateLimitSeconds() {
        return rateLimitSeconds;
    }

    public void setRateLimitSeconds(long rateLimitSeconds) {
        this.rateLimitSeconds = rateLimitSeconds;
    }
}

