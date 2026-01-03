package com.second_project.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.second_project.ecommerce.config.properties.CorsProperties;
import com.second_project.ecommerce.security.CustomUserDetailsService;
import com.second_project.ecommerce.security.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsProperties corsProperties;

    public WebSecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CorsProperties corsProperties) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsProperties = corsProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless JWT
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                
                // Password reset endpoints (public - no authentication required)
                .requestMatchers(HttpMethod.POST, "/api/user/forgot-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/user/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/user/verify").permitAll()
                
                // Error endpoint (Spring Boot default error handling)
                .requestMatchers("/error").permitAll()
                
                // Actuator endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                
                // Cart endpoints - authenticated users
                .requestMatchers("/api/cart/**").authenticated()
                
                // Order endpoints - authenticated users
                .requestMatchers("/api/orders/my-orders").authenticated()
                .requestMatchers("/api/orders/*/cancel").authenticated() // Single * instead of **
                .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Seller endpoints (accessible by SELLER and ADMIN)
                .requestMatchers("/api/seller/**").hasAnyRole("SELLER", "ADMIN")
                
                // User profile endpoints (authenticated)
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse allowed origins from properties
        String[] origins = corsProperties.getAllowedOrigins().split(",");
        configuration.setAllowedOrigins(Arrays.asList(origins));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

