-- Quick SQL to approve the pending product and fix category association
-- This will make the product visible on the frontend

-- Step 1: Check current product status and category association
SELECT 
    p.id, 
    p.name, 
    p.status, 
    p.is_featured,
    GROUP_CONCAT(c.id) as category_ids,
    GROUP_CONCAT(c.name) as category_names
FROM `ecommerce-dev`.products p
LEFT JOIN `ecommerce-dev`.product_category pc ON p.id = pc.product_id
LEFT JOIN `ecommerce-dev`.categories c ON pc.category_id = c.id
WHERE p.name = 'Áo thun'
GROUP BY p.id;

-- Step 2: Approve the product (change status from PENDING to APPROVED)
UPDATE `ecommerce-dev`.products 
SET status = 'APPROVED' 
WHERE name = 'Áo thun' AND status = 'PENDING';

-- Step 3: Check if product is associated with category ID 1 (Thời trang)
-- If not, associate it with category 1
INSERT INTO `ecommerce-dev`.product_category (product_id, category_id)
SELECT p.id, 1
FROM `ecommerce-dev`.products p
WHERE p.name = 'Áo thun'
  AND p.id NOT IN (
    SELECT product_id 
    FROM `ecommerce-dev`.product_category 
    WHERE category_id = 1
  );

-- Optional: Set as featured to appear in featured products section
-- UPDATE `ecommerce-dev`.products 
-- SET is_featured = 1 
-- WHERE name = 'Áo thun';

-- Step 4: Verify the updates
SELECT 
    p.id, 
    p.name, 
    p.status, 
    p.is_featured,
    GROUP_CONCAT(c.id) as category_ids,
    GROUP_CONCAT(c.name) as category_names
FROM `ecommerce-dev`.products p
LEFT JOIN `ecommerce-dev`.product_category pc ON p.id = pc.product_id
LEFT JOIN `ecommerce-dev`.categories c ON pc.category_id = c.id
WHERE p.name = 'Áo thun'
GROUP BY p.id;

