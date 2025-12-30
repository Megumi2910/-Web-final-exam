package com.second_project.ecommerce.event;

import org.springframework.context.ApplicationEvent;

import com.second_project.ecommerce.entity.User;

/**
 * Event published when a user completes registration or requests a verification email.
 * Listeners will handle token creation and email verification sending.
 * 
 * Note: Email URL is configured via FrontendProperties (application.yml),
 * not passed as parameter. This allows centralized configuration for different environments.
 */
public class RegistrationCompleteEvent extends ApplicationEvent {

    private final User user;

    public RegistrationCompleteEvent(User user) {
        super(user);
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}

