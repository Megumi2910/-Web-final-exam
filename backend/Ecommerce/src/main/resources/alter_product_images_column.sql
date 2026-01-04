-- Migration script to change product_images.images column from VARCHAR(500) to TEXT
-- This allows longer image URLs to be stored

ALTER TABLE product_images MODIFY COLUMN images TEXT;

