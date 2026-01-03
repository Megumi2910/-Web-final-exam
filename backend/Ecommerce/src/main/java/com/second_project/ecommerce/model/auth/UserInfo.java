package com.second_project.ecommerce.model.auth;

import com.second_project.ecommerce.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String role;
    private Boolean isVerified;
    private Boolean isSellerApproved;
    private String storeName;
    private String storeDescription;
    private String storeAddress;
    
    /**
     * Constructor to create UserInfo from User entity
     * @param user The User entity
     */
    public UserInfo(User user) {
        this.userId = user.getUserId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.address = user.getAddress();
        this.role = user.getRole() != null ? user.getRole().name() : null;
        this.isVerified = user.getIsVerified();
        this.isSellerApproved = user.getIsSellerApproved();
        this.storeName = user.getStoreName();
        this.storeDescription = user.getStoreDescription();
        this.storeAddress = user.getStoreAddress();
    }
}
