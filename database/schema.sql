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
-- VERIFICATION QUERIES (Optional - Run to verify)
-- ============================================
-- SELECT * FROM users;
-- SELECT * FROM categories;
-- SELECT * FROM products;
-- SELECT * FROM product_details;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
