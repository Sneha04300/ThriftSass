-- ============================================
-- TEST QUERIES - Demonstrating All SQL Features
-- Run these queries AFTER running schema.sql
-- ============================================

USE thriftsaas;

-- ============================================
-- 1. DDL (Data Definition Language)
-- ============================================
-- Already demonstrated in schema.sql with CREATE TABLE, CREATE INDEX, CREATE VIEW

-- ============================================
-- 2. DML (Data Manipulation Language)
-- ============================================

-- INSERT (already done in schema.sql)

-- UPDATE Examples
UPDATE products 
SET stock = stock + 5 
WHERE category_id = 1;

UPDATE users 
SET name = 'Updated Test User' 
WHERE email = 'test@example.com';

-- DELETE Example
DELETE FROM reviews 
WHERE rating < 3.0;

-- ============================================
-- 3. DQL (Data Query Language) - SELECT
-- ============================================

-- Simple SELECT
SELECT * FROM users;
SELECT * FROM products WHERE price > 800;

-- SELECT with WHERE and ORDER BY
SELECT name, price, stock 
FROM products 
WHERE stock > 5 
ORDER BY price DESC;

-- SELECT with LIMIT
SELECT name, price 
FROM products 
ORDER BY price DESC 
LIMIT 3;

-- ============================================
-- 4. JOINS
-- ============================================

-- INNER JOIN - Get orders with user details
SELECT 
    u.name AS customer_name,
    u.email,
    o.id AS order_id,
    o.total_amount,
    o.status,
    o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN - All products with their categories
SELECT 
    p.name AS product_name,
    p.price,
    c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- MULTIPLE JOINS - Complete order details
SELECT 
    u.name AS customer,
    o.id AS order_id,
    p.name AS product,
    oi.quantity,
    oi.price_at_purchase,
    (oi.quantity * oi.price_at_purchase) AS line_total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;

-- RIGHT JOIN - All categories with product count
SELECT 
    c.name AS category,
    COUNT(p.id) AS product_count
FROM products p
RIGHT JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name;

-- ============================================
-- 5. SUBQUERIES
-- ============================================

-- Simple Subquery - Products above average price
SELECT name, price 
FROM products 
WHERE price > (SELECT AVG(price) FROM products);

-- Subquery with IN - Users who have placed orders
SELECT name, email 
FROM users 
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- Subquery with EXISTS - Products that have been ordered
SELECT name, price 
FROM products p
WHERE EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);

-- Correlated Subquery - Products priced above their category average
SELECT 
    p.name,
    p.price,
    c.name AS category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category_id = p.category_id
);

-- Subquery in SELECT - Product with review count
SELECT 
    p.name,
    p.price,
    (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS review_count
FROM products p;

-- ============================================
-- 6. AGGREGATE FUNCTIONS
-- ============================================

-- COUNT
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(DISTINCT category_id) AS total_categories_with_products FROM products;

-- SUM
SELECT SUM(total_amount) AS total_revenue FROM orders WHERE status = 'completed';
SELECT SUM(stock) AS total_inventory FROM products;

-- AVG
SELECT AVG(price) AS average_product_price FROM products;
SELECT AVG(rating) AS average_rating FROM reviews;

-- MIN & MAX
SELECT 
    MIN(price) AS cheapest_product,
    MAX(price) AS most_expensive_product
FROM products;

-- Multiple Aggregates
SELECT 
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    MIN(total_amount) AS smallest_order,
    MAX(total_amount) AS largest_order
FROM orders;

-- ============================================
-- 7. GROUP BY & HAVING
-- ============================================

-- GROUP BY - Products per category
SELECT 
    c.name AS category,
    COUNT(p.id) AS product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;

-- GROUP BY with HAVING - Categories with more than 1 product
SELECT 
    c.name AS category,
    COUNT(p.id) AS product_count
FROM categories c
JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING COUNT(p.id) > 1;

-- GROUP BY with multiple aggregates
SELECT 
    c.name AS category,
    COUNT(p.id) AS product_count,
    AVG(p.price) AS avg_price,
    MIN(p.price) AS min_price,
    MAX(p.price) AS max_price,
    SUM(p.stock) AS total_stock
FROM categories c
JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;

-- HAVING with condition - Categories with average price > 700
SELECT 
    c.name AS category,
    AVG(p.price) AS avg_price
FROM categories c
JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING AVG(p.price) > 700;

-- ============================================
-- 8. SCALAR FUNCTIONS
-- ============================================

-- String Functions
SELECT 
    UPPER(name) AS name_upper,
    LOWER(email) AS email_lower,
    CONCAT(name, ' - ', email) AS full_info,
    LENGTH(name) AS name_length,
    SUBSTRING(email, 1, 5) AS email_prefix
FROM users;

-- Date Functions
SELECT 
    name,
    created_at,
    DATE_FORMAT(created_at, '%Y-%m-%d') AS formatted_date,
    DATE_FORMAT(created_at, '%W, %M %d, %Y') AS long_format,
    DATEDIFF(NOW(), created_at) AS days_since_joined
FROM users;

-- Math Functions
SELECT 
    name,
    price,
    ROUND(price, 0) AS rounded_price,
    CEIL(price) AS ceiling_price,
    FLOOR(price) AS floor_price,
    price * 0.9 AS discounted_price
FROM products;

-- Conditional Functions
SELECT 
    name,
    stock,
    CASE 
        WHEN stock = 0 THEN 'Out of Stock'
        WHEN stock < 5 THEN 'Low Stock'
        WHEN stock < 10 THEN 'Medium Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM products;

-- ============================================
-- 9. VIEWS
-- ============================================

-- Query existing views
SELECT * FROM product_details;
SELECT * FROM user_order_summary;
SELECT * FROM product_sales_summary;
SELECT * FROM top_rated_products;

-- ============================================
-- 10. STORED PROCEDURES
-- ============================================

-- Call AddNewUser procedure
CALL AddNewUser('Alice Johnson', 'alice@example.com', '$2a$10$hashedpassword123');

-- Call PlaceOrder procedure (with transaction)
CALL PlaceOrder(1, 3, 2);

-- Call UpdateProductStock procedure
CALL UpdateProductStock(0, 25);

-- ============================================
-- 11. FUNCTIONS (Custom)
-- ============================================

-- Test GetUserTotalSpending function
SELECT 
    u.name,
    u.email,
    GetUserTotalSpending(u.id) AS total_spending
FROM users;

-- Test GetProductAvgRating function
SELECT 
    p.name,
    p.price,
    GetProductAvgRating(p.id) AS avg_rating
FROM products
LIMIT 5;

-- Test IsProductInStock function
SELECT 
    p.name,
    p.stock,
    IsProductInStock(p.id) AS stock_status
FROM products;

-- ============================================
-- 12. TCL (Transaction Control Language)
-- ============================================

-- Example 1: Simple Transaction
START TRANSACTION;

INSERT INTO users (name, email, password_hash) 
VALUES ('Bob Wilson', 'bob@example.com', '$2a$10$testpassword');

INSERT INTO orders (user_id, total_amount, status) 
VALUES (LAST_INSERT_ID(), 1500.00, 'pending');

COMMIT;

-- Example 2: Transaction with Rollback
START TRANSACTION;

UPDATE products SET price = price * 1.1 WHERE category_id = 1;

-- Check the changes
SELECT name, price FROM products WHERE category_id = 1;

-- Rollback if not satisfied
ROLLBACK;

-- Example 3: Transaction with Savepoint
START TRANSACTION;

INSERT INTO categories (name) VALUES ('Electronics');
SAVEPOINT after_category;

INSERT INTO products (id, name, price, category_id, image_url, stock) 
VALUES (100, 'Test Product', 999.00, LAST_INSERT_ID(), '/test.jpg', 10);

-- If product insert fails, rollback to savepoint
-- ROLLBACK TO SAVEPOINT after_category;

COMMIT;

-- ============================================
-- 13. COMPLEX QUERIES
-- ============================================

-- Query 1: Top 3 customers by spending
SELECT 
    u.name,
    u.email,
    COUNT(o.id) AS order_count,
    SUM(o.total_amount) AS total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC
LIMIT 3;

-- Query 2: Products never ordered
SELECT p.name, p.price, p.stock
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);

-- Query 3: Category revenue report
SELECT 
    c.name AS category,
    COUNT(DISTINCT p.id) AS products_in_category,
    COUNT(oi.id) AS times_ordered,
    COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total_revenue
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- Query 4: Monthly order summary
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS month,
    COUNT(*) AS order_count,
    SUM(total_amount) AS monthly_revenue,
    AVG(total_amount) AS avg_order_value
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month DESC;

-- Query 5: Products with reviews and ratings
SELECT 
    p.name AS product,
    p.price,
    COUNT(r.id) AS review_count,
    AVG(r.rating) AS avg_rating,
    MIN(r.rating) AS min_rating,
    MAX(r.rating) AS max_rating
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.price
ORDER BY avg_rating DESC;

-- ============================================
-- END OF TEST QUERIES
-- ============================================
