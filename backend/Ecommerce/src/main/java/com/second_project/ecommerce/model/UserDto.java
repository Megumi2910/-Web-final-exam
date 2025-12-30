package com.second_project.ecommerce.model;

import com.second_project.ecommerce.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for User entity in admin management.
 * Maps single role to roles array for frontend compatibility.
 */
@Data
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    
    // Single role from entity, but exposed as array for frontend compatibility
    private List<String> roles;
    
    // isVerified from entity, but exposed as enabled for frontend compatibility
    private Boolean enabled;
    private Boolean isVerified;
    private Boolean isSellerApproved;
    
    private String storeName;
    private String storeDescription;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Convert User entity to UserDto.
     * Maps single role to roles array and isVerified to enabled.
     */
    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getUserId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        
        // Map single role to roles array
        List<String> roles = new ArrayList<>();
        if (user.getRole() != null) {
            roles.add(user.getRole().name());
            // SELLER implicitly has CUSTOMER permissions
            if (user.getRole() == User.UserRole.SELLER) {
                roles.add(User.UserRole.CUSTOMER.name());
            }
        }
        dto.setRoles(roles);
        
        // Map isVerified to enabled (frontend expects enabled)
        dto.setEnabled(user.getIsVerified() != null && user.getIsVerified());
        dto.setIsVerified(user.getIsVerified());
        dto.setIsSellerApproved(user.getIsSellerApproved());
        dto.setStoreName(user.getStoreName());
        dto.setStoreDescription(user.getStoreDescription());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        return dto;
    }
}

