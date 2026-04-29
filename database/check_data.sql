-- ============================================
-- Check Database Data - Copy these queries to MySQL Workbench
-- ============================================

-- Use the database
USE thriftsaas;

-- ============================================
-- CHECK ALL TABLES
-- ============================================

-- 1. Check all users (signup data will appear here)
SELECT * FROM users;

-- 2. Check all categories
SELECT * FROM categories;

-- 3. Check all products
SELECT * FROM products;

-- 4. Check all orders
SELECT * FROM orders;

-- 5. Check all order items
SELECT * FROM order_items;

-- 6. Check all reviews
SELECT * FROM reviews;

-- ============================================
-- CHECK SPECIFIC USER BY EMAIL
-- ============================================
-- Replace 'your-email@example.com' with the email you used to signup
-- SELECT * FROM users WHERE email = 'your-email@example.com';

-- ============================================
-- COUNT RECORDS IN EACH TABLE
-- ============================================
SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;

-- ============================================
-- CHECK LATEST USERS (Most recent signups)
-- ============================================
SELECT id, name, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- CHECK IF DATABASE EXISTS
-- ============================================
SHOW DATABASES LIKE 'thriftsaas';

-- ============================================
-- CHECK ALL TABLES IN DATABASE
-- ============================================
SHOW TABLES;
