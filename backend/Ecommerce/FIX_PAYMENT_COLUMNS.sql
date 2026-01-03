-- Fix payment_method and payment_status column sizes
-- Run this SQL script in your database to fix the column size issue

USE ecommerce_dev;

-- Alter payment_method column to allow longer values
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(20) NOT NULL;

-- Alter payment_status column to allow longer values  
ALTER TABLE payments MODIFY COLUMN payment_status VARCHAR(20) NOT NULL;

-- Verify the changes
DESCRIBE payments;

