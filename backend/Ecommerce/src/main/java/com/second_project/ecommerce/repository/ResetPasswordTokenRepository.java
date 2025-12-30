package com.second_project.ecommerce.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.second_project.ecommerce.entity.ResetPasswordToken;
import com.second_project.ecommerce.entity.User;

@Repository
public interface ResetPasswordTokenRepository extends JpaRepository<ResetPasswordToken, Long> {
    
    Optional<ResetPasswordToken> findByToken(String token);
    
    @Modifying
    void deleteByUser(User user);
    
    @Modifying
    @Query("DELETE FROM ResetPasswordToken rpt WHERE rpt.expiryDate < :now OR rpt.used = true")
    void deleteExpiredOrUsedTokens(LocalDateTime now);
}

