-- Migration script to add editCount column and make rating NOT NULL in reviews table
-- This allows tracking how many times a review has been edited (max 1 edit allowed)

-- Add editCount column
ALTER TABLE reviews ADD COLUMN edit_count INTEGER NOT NULL DEFAULT 0;

-- Make rating NOT NULL (revert from nullable)
ALTER TABLE reviews MODIFY COLUMN rating INTEGER NOT NULL;

