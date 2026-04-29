-- ============================================
-- ThriftSass MySQL Database Setup
-- Copy and paste this entire file into MySQL Workbench
-- ============================================

-- Create and use database
CREATE DATABASE IF NOT EXISTS thriftsaas;
USE thriftsaas;

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    stock INT DEFAULT 0,
    type VARCHAR(50) DEFAULT 'regular',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: order_items
-- ============================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ============================================
-- TABLE: reviews
-- ============================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert Categories
INSERT INTO categories (id, name) VALUES 
(1, 'Clothing'),
(2, 'Jewellery'),
(3, 'Home Decor'),
(4, 'Accessories'),
(5, 'Books');

-- Insert Products
INSERT INTO products (id, name, price, category_id, image_url, description, stock, type) VALUES 
(0, 'Blue Polka Top', 899.00, 1, '/assets/download2.jpeg', 'Trendy blue polka dot top with soft cotton fabric.', 12, 'regular'),
(1, 'Beaded Necklace', 499.00, 2, '/assets/bangle collection.jpeg', 'Elegant handcrafted beaded necklace.', 7, 'regular'),
(2, 'Vintage Bracelet', 1299.00, 2, '/assets/blue themed blacelet!!.jpeg', 'Antique-inspired bracelet.', 4, 'featured'),
(3, 'Retro Lamp', 799.00, 3, '/assets/download6.jpeg', 'Warm retro-style lamp.', 10, 'regular'),
(4, 'Classic Handbag', 999.00, 4, '/assets/hello.jpeg', 'Stylish leather handbag.', 8, 'regular'),
(5, 'Old Novel Set', 599.00, 5, '/assets/download12.jpeg', 'Vintage set of classic novels.', 5, 'regular'),
(6, 'Classic Handbag Variant', 999.00, 4, '/assets/hello.jpeg', 'Stylish leather handbag variant.', 8, 'regular'),
(7, 'Old Novel Set Variant 1', 599.00, 5, '/assets/download12.jpeg', 'Vintage set of classic novels.', 5, 'regular'),
(8, 'Old Novel Set Variant 2', 599.00, 5, '/assets/download12.jpeg', 'Vintage set of classic novels.', 5, 'regular');

-- Insert Test Users (password is 'password123' for both)
INSERT INTO users (name, email, password_hash) VALUES 
('Test User', 'test@example.com', '$2a$10$xyz123abc'),
('John Doe', 'john@example.com', '$2a$10$xyz123abc');

-- Insert Sample Orders
INSERT INTO orders (user_id, total_amount, status) VALUES 
(1, 1398.00, 'completed'),
(2, 1299.00, 'pending');

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(1, 0, 1, 899.00),
(1, 1, 1, 499.00),
(2, 2, 1, 1299.00);

-- Insert Sample Reviews
INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES 
(1, 0, 4.6, 'Great top, very comfortable!'),
(2, 2, 4.8, 'Beautiful bracelet.');

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- CREATE VIEW FOR PRODUCT DETAILS
-- ============================================
CREATE OR REPLACE VIEW product_details AS
SELECT p.id, p.name, p.price, c.name AS category_name, p.image_url, p.stock
FROM products p
JOIN categories c ON p.category_id = c.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure 1: Add a new user safely
DELIMITER //
CREATE PROCEDURE AddNewUser(
    IN p_name VARCHAR(100), 
    IN p_email VARCHAR(150), 
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO users (name, email, password_hash) 
    VALUES (p_name, LOWER(p_email), p_password);
END //
DELIMITER ;

-- Procedure 2: Place an order with transaction (TCL)
DELIMITER //
CREATE PROCEDURE PlaceOrder(
    IN p_user_id INT, 
    IN p_product_id INT, 
    IN p_quantity INT
)
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_product_price DECIMAL(10,2);
    DECLARE v_new_order_id INT;
    DECLARE v_total_amount DECIMAL(10,2);

    -- Start Transaction (TCL)
    START TRANSACTION;

    -- Lock the product row for update
    SELECT stock, price INTO v_current_stock, v_product_price 
    FROM products 
    WHERE id = p_product_id 
    FOR UPDATE;

    -- Check if sufficient stock exists
    IF v_current_stock >= p_quantity THEN
        -- Calculate total
        SET v_total_amount = v_product_price * p_quantity;
        
        -- Create Order
        INSERT INTO orders (user_id, total_amount, status) 
        VALUES (p_user_id, v_total_amount, 'completed');
        
        SET v_new_order_id = LAST_INSERT_ID();
        
        -- Create Order Item
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
        VALUES (v_new_order_id, p_product_id, p_quantity, v_product_price);
        
        -- Update Stock (DML - UPDATE)
        UPDATE products 
        SET stock = stock - p_quantity 
        WHERE id = p_product_id;
        
        -- Commit Transaction (TCL)
        COMMIT;
        
        SELECT 'Order placed successfully' AS message, v_new_order_id AS order_id;
    ELSE
        -- Rollback Transaction (TCL)
        ROLLBACK;
        
        SELECT 'Insufficient stock' AS message, 0 AS order_id;
    END IF;
END //
DELIMITER ;

-- Procedure 3: Update product stock
DELIMITER //
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id INT,
    IN p_new_stock INT
)
BEGIN
    UPDATE products 
    SET stock = p_new_stock 
    WHERE id = p_product_id;
    
    SELECT CONCAT('Stock updated for product ID: ', p_product_id) AS message;
END //
DELIMITER ;

-- Procedure 4: Delete old reviews (DML - DELETE)
DELIMITER //
CREATE PROCEDURE DeleteOldReviews(IN days_old INT)
BEGIN
    DELETE FROM reviews 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_old DAY);
    
    SELECT ROW_COUNT() AS deleted_count;
END //
DELIMITER ;

-- ============================================
-- FUNCTIONS (Scalar & Aggregate)
-- ============================================

-- Function 1: Calculate user's total spending (Aggregate)
DELIMITER //
CREATE FUNCTION GetUserTotalSpending(p_user_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total DECIMAL(10,2);
    
    SELECT COALESCE(SUM(total_amount), 0) INTO total
    FROM orders
    WHERE user_id = p_user_id AND status = 'completed';
    
    RETURN total;
END //
DELIMITER ;

-- Function 2: Get product average rating (Aggregate)
DELIMITER //
CREATE FUNCTION GetProductAvgRating(p_product_id INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM reviews
    WHERE product_id = p_product_id;
    
    RETURN avg_rating;
END //
DELIMITER ;

-- Function 3: Check if product is in stock (Scalar)
DELIMITER //
CREATE FUNCTION IsProductInStock(p_product_id INT)
RETURNS VARCHAR(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE stock_count INT;
    
    SELECT stock INTO stock_count
    FROM products
    WHERE id = p_product_id;
    
    IF stock_count > 0 THEN
        RETURN 'In Stock';
    ELSE
        RETURN 'Out of Stock';
    END IF;
END //
DELIMITER ;

-- ============================================
-- ADDITIONAL VIEWS
-- ============================================

-- View 2: User order summary
CREATE OR REPLACE VIEW user_order_summary AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    MAX(o.order_date) AS last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;

-- View 3: Product sales summary
CREATE OR REPLACE VIEW product_sales_summary AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    COUNT(oi.id) AS times_sold,
    COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
    COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY p.id, p.name, c.name;

-- View 4: Top rated products
CREATE OR REPLACE VIEW top_rated_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    AVG(r.rating) AS avg_rating,
    COUNT(r.id) AS review_count
FROM products p
INNER JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.price
HAVING AVG(r.rating) >= 4.0
ORDER BY avg_rating DESC, review_count DESC;

-- ============================================
-- COMPLEX QUERIES WITH JOINS, SUBQUERIES, GROUP BY, HAVING
-- ============================================

-- Query 1: INNER JOIN - Get all orders with user and product details
-- SELECT 
--     u.name AS customer_name,
--     o.id AS order_id,
--     o.order_date,
--     p.name AS product_name,
--     oi.quantity,
--     oi.price_at_purchase
-- FROM users u
-- INNER JOIN orders o ON u.id = o.user_id
-- INNER JOIN order_items oi ON o.id = oi.order_id
-- INNER JOIN products p ON oi.product_id = p.id;

-- Query 2: LEFT JOIN - All products with their review count
-- SELECT 
--     p.name AS product_name,
--     COUNT(r.id) AS review_count,
--     COALESCE(AVG(r.rating), 0) AS avg_rating
-- FROM products p
-- LEFT JOIN reviews r ON p.id = r.product_id
-- GROUP BY p.id, p.name;

-- Query 3: SUBQUERY - Products priced above average
-- SELECT name, price 
-- FROM products 
-- WHERE price > (SELECT AVG(price) FROM products);

-- Query 4: SUBQUERY - Users who have placed orders
-- SELECT name, email 
-- FROM users 
-- WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- Query 5: GROUP BY & HAVING - Categories with average price > 700
-- SELECT 
--     c.name AS category_name,
--     COUNT(p.id) AS product_count,
--     AVG(p.price) AS avg_price,
--     MIN(p.price) AS min_price,
--     MAX(p.price) AS max_price
-- FROM categories c
-- JOIN products p ON c.id = p.category_id
-- GROUP BY c.id, c.name
-- HAVING AVG(p.price) > 700;

-- Query 6: AGGREGATE FUNCTIONS - Order statistics
-- SELECT 
--     COUNT(*) AS total_orders,
--     SUM(total_amount) AS total_revenue,
--     AVG(total_amount) AS avg_order_value,
--     MIN(total_amount) AS min_order,
--     MAX(total_amount) AS max_order
-- FROM orders
-- WHERE status = 'completed';

-- Query 7: SCALAR FUNCTIONS - Format user data
-- SELECT 
--     UPPER(name) AS name_upper,
--     LOWER(email) AS email_lower,
--     CONCAT(name, ' (', email, ')') AS full_info,
--     DATE_FORMAT(created_at, '%Y-%m-%d') AS join_date
-- FROM users;

-- Query 8: CORRELATED SUBQUERY - Products with above-category-average price
-- SELECT p1.name, p1.price, c.name AS category
-- FROM products p1
-- JOIN categories c ON p1.category_id = c.id
-- WHERE p1.price > (
--     SELECT AVG(p2.price)
--     FROM products p2
--     WHERE p2.category_id = p1.category_id
-- );

-- ============================================
-- DML EXAMPLES (UPDATE & DELETE)
-- ============================================

-- UPDATE Example: Apply 10% discount to all Jewellery products
-- UPDATE products 
-- SET price = price * 0.9 
-- WHERE category_id = (SELECT id FROM categories WHERE name = 'Jewellery');

-- DELETE Example: Remove products with zero stock
-- DELETE FROM products WHERE stock = 0;

-- ============================================
-- TCL EXAMPLES (Transaction Control)
-- ============================================

-- Example Transaction with SAVEPOINT
-- START TRANSACTION;
-- 
-- INSERT INTO users (name, email, password_hash) 
-- VALUES ('New User', 'newuser@test.com', 'hashedpass');
-- 
-- SAVEPOINT after_user_insert;
-- 
-- INSERT INTO orders (user_id, total_amount, status) 
-- VALUES (LAST_INSERT_ID(), 500.00, 'pending');
-- 
-- -- If something goes wrong, rollback to savepoint
-- -- ROLLBACK TO SAVEPOINT after_user_insert;
-- 
-- -- Or commit everything
-- COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test Views
-- SELECT * FROM product_details;
-- SELECT * FROM user_order_summary;
-- SELECT * FROM product_sales_summary;
-- SELECT * FROM top_rated_products;

-- Test Functions
-- SELECT GetUserTotalSpending(1) AS user_1_total_spending;
-- SELECT GetProductAvgRating(0) AS product_0_avg_rating;
-- SELECT IsProductInStock(0) AS product_0_stock_status;

-- Test Procedures
-- CALL AddNewUser('Jane Smith', 'jane@example.com', '$2a$10$hashedpassword');
-- CALL PlaceOrder(1, 0, 2);
-- CALL UpdateProductStock(0, 20);

-- ============================================
-- SETUP COMPLETE!
-- All SQL Features Implemented:
-- ✅ DDL (CREATE, DROP, ALTER)
-- ✅ DML (INSERT, UPDATE, DELETE)
-- ✅ DQL (SELECT with JOINs, Subqueries)
-- ✅ TCL (COMMIT, ROLLBACK, SAVEPOINT)
-- ✅ Functions (Scalar & Aggregate)
-- ✅ Stored Procedures
-- ✅ Views (Multiple)
-- ✅ Indexes
-- ✅ GROUP BY & HAVING
-- ✅ Subqueries (Simple & Correlated)
-- ============================================
