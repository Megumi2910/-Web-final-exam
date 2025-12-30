package com.second_project.ecommerce;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class EcommerceApplication {

	@PostConstruct
	public void init() {
		// Set JVM timezone to GMT+7 (Asia/Bangkok)
		TimeZone.setDefault(TimeZone.getTimeZone("GMT+7"));
	}

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}
}

