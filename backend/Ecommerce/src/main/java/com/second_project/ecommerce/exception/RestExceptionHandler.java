package com.second_project.ecommerce.exception;

import com.second_project.ecommerce.model.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for REST API endpoints.
 * Catches all exceptions and returns proper JSON error responses.
 * 
 * BEST PRACTICES:
 * - Centralized error handling
 * - Consistent error response format
 * - Proper HTTP status codes
 * - Logging for debugging
 * - User-friendly error messages
 */
@RestControllerAdvice(basePackages = "com.second_project.ecommerce.controller.rest")
@Slf4j
public class RestExceptionHandler {

    /**
     * Handles IllegalArgumentException (validation errors, not found, etc.)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handles all other unexpected exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        
        // Return user-friendly message without exposing internal details
        String message = "An error occurred while processing your request. Please try again later.";
        
        // In development, you might want to include more details
        if (log.isDebugEnabled()) {
            message = ex.getMessage();
        }
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(message));
    }
}

