-- Migration script to add cancellation_reason column to orders table
-- Database: MySQL
-- 
-- IMPORTANT: If the column already exists, this will show an error.
-- That's okay - it means the column is already there.
-- You can safely ignore the error if you see: "Duplicate column name 'cancellation_reason'"

ALTER TABLE orders 
ADD COLUMN cancellation_reason VARCHAR(500) NULL 
COMMENT 'Reason provided by user when cancelling the order (optional, max 500 characters)';

