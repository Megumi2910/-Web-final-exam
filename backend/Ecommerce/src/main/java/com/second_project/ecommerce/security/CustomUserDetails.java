package com.second_project.ecommerce.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.second_project.ecommerce.entity.User;
import com.second_project.ecommerce.entity.User.UserRole;

public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String password;
    private final UserRole role;
    private final boolean enabled;

    public CustomUserDetails(Long userId, String firstName, String lastName, String email, 
                           String password, UserRole role, boolean enabled) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("First name cannot be null or blank");
        }
        if (lastName == null || lastName.isBlank()) {
            throw new IllegalArgumentException("Last name cannot be null or blank");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be null or blank");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password cannot be null or blank");
        }
        if (role == null) {
            throw new IllegalArgumentException("User role cannot be null");
        }
        
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.enabled = enabled;
    }

    public CustomUserDetails(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        this.userId = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.role = user.getRole();
        this.enabled = user.isEnabled();
        
        if (this.userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (this.firstName == null || this.firstName.isBlank()) {
            throw new IllegalArgumentException("User first name cannot be null or blank");
        }
        if (this.lastName == null || this.lastName.isBlank()) {
            throw new IllegalArgumentException("User last name cannot be null or blank");
        }
        if (this.email == null || this.email.isBlank()) {
            throw new IllegalArgumentException("User email cannot be null or blank");
        }
        if (this.password == null || this.password.isBlank()) {
            throw new IllegalArgumentException("User password cannot be null or blank");
        }
        if (this.role == null) {
            throw new IllegalArgumentException("User role cannot be null");
        }
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isVerified() {
        return enabled;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String authority = "ROLE_" + role.name();
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true; // Always allow login, verification checked separately
    }

    @Override
    public String toString() {
        return "CustomUserDetails{" +
                "userId=" + userId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", enabled=" + enabled +
                '}';
    }
}

