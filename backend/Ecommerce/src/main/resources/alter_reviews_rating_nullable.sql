-- Migration script to make rating column nullable in reviews table
-- This allows admin and seller comments without ratings

ALTER TABLE reviews MODIFY COLUMN rating INTEGER NULL;

