# 🛍️ ThriftSass E-Commerce Project Documentation

## Complete Guide to SQL Features & Frontend Integration

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Database Architecture](#database-architecture)
3. [SQL Concepts Used](#sql-concepts-used)
4. [Features & Implementation](#features--implementation)
5. [API Endpoints](#api-endpoints)
6. [Frontend-Backend Flow](#frontend-backend-flow)

---

## 1. Project Overview

**ThriftSass** is a full-stack e-commerce application for sustainable thrift shopping.

### Tech Stack:
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Template Engine:** EJS
- **Session Management:** Express-session

### Key Features:
- User Authentication (Signup/Login)
- Product Catalog with Categories
- Shopping Cart (Session-based)
- Product Reviews & Ratings
- Advanced Search & Filters
- Analytics Dashboard
- Order Management

---

## 2. Database Architecture

### Database Schema (6 Tables)

```sql
thriftsaas
├── users (User accounts)
├── categories (Product categories)
├── products (Product catalog)
├── orders (Customer orders)
├── order_items (Order line items)
└── reviews (Product reviews)
```


### Entity Relationships:

```
users (1) ──→ (M) orders
users (1) ──→ (M) reviews
categories (1) ──→ (M) products
products (1) ──→ (M) reviews
products (1) ──→ (M) order_items
orders (1) ──→ (M) order_items
```

---

## 3. SQL Concepts Used

### 3.1 DDL (Data Definition Language)

**Concept:** Commands to define database structure

**Used in Project:**

#### CREATE TABLE
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Creates the database tables with constraints

#### CREATE INDEX
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_users_email ON users(email);
```

**Purpose:** Improves query performance for frequently searched columns


#### CREATE VIEW
```sql
CREATE VIEW product_details AS
SELECT p.id, p.name, p.price, c.name AS category_name, p.image_url, p.stock
FROM products p
JOIN categories c ON p.category_id = c.id;
```

**Purpose:** Simplifies complex queries by creating reusable virtual tables

---

### 3.2 DML (Data Manipulation Language)

**Concept:** Commands to manipulate data in tables

#### INSERT
```sql
INSERT INTO users (name, email, password_hash) 
VALUES ('John Doe', 'john@example.com', '$2a$10$hashedpassword');
```

**Used in:** User signup, adding reviews, placing orders

#### UPDATE
```sql
UPDATE products 
SET stock = stock - 2 
WHERE id = 0;
```

**Used in:** Stock management, updating user profiles

#### DELETE
```sql
DELETE FROM reviews 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
```

**Used in:** Removing old data, deleting reviews


---

### 3.3 DQL (Data Query Language)

**Concept:** Commands to retrieve data from database

#### Simple SELECT
```sql
SELECT * FROM products WHERE price > 800;
```

**Used in:** Fetching products, user data, orders

#### SELECT with JOIN
```sql
SELECT u.name, o.total_amount, o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

**Used in:** Getting order details with user information

#### SELECT with Subquery
```sql
SELECT name, price 
FROM products 
WHERE price > (SELECT AVG(price) FROM products);
```

**Used in:** Finding premium products above average price

---

### 3.4 TCL (Transaction Control Language)

**Concept:** Commands to manage database transactions (ACID properties)

#### Transaction Example
```sql
START TRANSACTION;

UPDATE products SET stock = stock - 2 WHERE id = 0;
INSERT INTO orders (user_id, total_amount) VALUES (1, 1798.00);

COMMIT;
```

**Used in:** Order placement (ensures data consistency)


---

### 3.5 JOINS

**Concept:** Combine rows from multiple tables based on related columns

#### INNER JOIN
```sql
SELECT p.name, c.name AS category
FROM products p
INNER JOIN categories c ON p.category_id = c.id;
```

**Purpose:** Get products with their category names

#### LEFT JOIN
```sql
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

**Purpose:** Get all users with their order count (including users with 0 orders)

#### Multiple JOINS
```sql
SELECT u.name, o.id, p.name AS product
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;
```

**Purpose:** Get complete order details with user and product information


---

### 3.6 Aggregate Functions

**Concept:** Perform calculations on multiple rows and return single value

#### COUNT
```sql
SELECT COUNT(*) AS total_products FROM products;
```

**Used in:** Counting products, orders, reviews

#### SUM
```sql
SELECT SUM(total_amount) AS total_revenue 
FROM orders 
WHERE status = 'completed';
```

**Used in:** Calculating total revenue, total spending

#### AVG
```sql
SELECT AVG(rating) AS avg_rating 
FROM reviews 
WHERE product_id = 0;
```

**Used in:** Product average ratings

#### MIN & MAX
```sql
SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive 
FROM products;
```

**Used in:** Finding price ranges


---

### 3.7 GROUP BY & HAVING

**Concept:** Group rows and filter grouped results

#### GROUP BY
```sql
SELECT category_id, COUNT(*) AS product_count
FROM products
GROUP BY category_id;
```

**Purpose:** Count products per category

#### HAVING
```sql
SELECT c.name, AVG(p.price) AS avg_price
FROM categories c
JOIN products p ON c.id = p.category_id
GROUP BY c.name
HAVING AVG(p.price) > 700;
```

**Purpose:** Filter categories with average price > 700

---

### 3.8 Subqueries

**Concept:** Query nested inside another query

#### Simple Subquery
```sql
SELECT name, price 
FROM products 
WHERE price > (SELECT AVG(price) FROM products);
```

**Purpose:** Find products above average price

#### Correlated Subquery
```sql
SELECT p1.name, p1.price
FROM products p1
WHERE p1.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);
```

**Purpose:** Find products above their category's average price


---

### 3.9 Stored Procedures

**Concept:** Reusable SQL code blocks stored in database

#### PlaceOrder Procedure
```sql
DELIMITER //
CREATE PROCEDURE PlaceOrder(
    IN p_user_id INT, 
    IN p_product_id INT, 
    IN p_quantity INT
)
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_product_price DECIMAL(10,2);
    
    START TRANSACTION;
    
    SELECT stock, price INTO v_current_stock, v_product_price 
    FROM products WHERE id = p_product_id FOR UPDATE;
    
    IF v_current_stock >= p_quantity THEN
        INSERT INTO orders (user_id, total_amount, status) 
        VALUES (p_user_id, v_product_price * p_quantity, 'completed');
        
        UPDATE products SET stock = stock - p_quantity 
        WHERE id = p_product_id;
        
        COMMIT;
    ELSE
        ROLLBACK;
    END IF;
END //
DELIMITER ;
```

**Purpose:** Safely place orders with transaction management

**Usage:** `CALL PlaceOrder(1, 0, 2);`


---

### 3.10 Custom Functions

**Concept:** User-defined functions that return values

#### GetUserTotalSpending Function
```sql
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
END;
```

**Purpose:** Calculate user's total spending

**Usage:** `SELECT GetUserTotalSpending(1);`

#### GetProductAvgRating Function
```sql
CREATE FUNCTION GetProductAvgRating(p_product_id INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM reviews WHERE product_id = p_product_id;
    RETURN avg_rating;
END;
```

**Purpose:** Get product's average rating

**Usage:** `SELECT GetProductAvgRating(0);`


---

### 3.11 Views

**Concept:** Virtual tables based on SELECT queries

#### product_details View
```sql
CREATE VIEW product_details AS
SELECT p.id, p.name, p.price, c.name AS category_name, 
       p.image_url, p.stock
FROM products p
JOIN categories c ON p.category_id = c.id;
```

**Purpose:** Simplified product data with category names

#### user_order_summary View
```sql
CREATE VIEW user_order_summary AS
SELECT u.id, u.name, u.email,
       COUNT(o.id) AS total_orders,
       COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

**Purpose:** User statistics with order count and spending

#### product_sales_summary View
```sql
CREATE VIEW product_sales_summary AS
SELECT p.id, p.name, c.name AS category_name,
       COUNT(oi.id) AS times_sold,
       COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY p.id;
```

**Purpose:** Product sales analytics


---

## 4. Features & Implementation

### Feature 1: User Authentication

**SQL Concepts Used:** INSERT, SELECT, Hashing

#### How It Works:

**1. User Signup**
```javascript
// Frontend: scripts/auth.js
fetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
});
```

```javascript
// Backend: server/routes/authRoutes.js
const hashedPassword = await bcrypt.hash(password, 10);
await pool.execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
);
```

**SQL Query:**
```sql
INSERT INTO users (name, email, password_hash) 
VALUES ('John Doe', 'john@example.com', '$2a$10$xyz...');
```

**2. User Login**
```javascript
// Backend: Verify credentials
const [users] = await pool.execute(
    "SELECT * FROM users WHERE email = ?", 
    [email]
);
const match = await bcrypt.compare(password, user.password_hash);
```

**SQL Query:**
```sql
SELECT * FROM users WHERE email = 'john@example.com';
```


---

### Feature 2: Product Catalog

**SQL Concepts Used:** SELECT, JOIN, WHERE, encodeURI

#### How It Works:

**1. Fetch All Products**
```javascript
// Frontend: scripts/shop_app.js
fetch("/api/products")
    .then(res => res.json())
    .then(products => displayProducts(products));
```

```javascript
// Backend: server/routes/productRoutes.js
const [products] = await pool.execute("SELECT * FROM products");
const fixedProducts = products.map(product => ({
    ...product,
    image_url: encodeURI(product.image_url)
}));
res.json(fixedProducts);
```

**SQL Query:**
```sql
SELECT * FROM products;
```

**2. Get Single Product**
```javascript
// Frontend: Navigate to /product/0
// Backend: Extract ID and query
const [products] = await pool.execute(
    "SELECT * FROM products WHERE id = ?", 
    [id]
);
```

**SQL Query:**
```sql
SELECT * FROM products WHERE id = 0;
```


---

### Feature 3: Advanced Product Search

**SQL Concepts Used:** WHERE, Subqueries, Custom Functions, Complex Filtering

#### How It Works:

**Frontend: scripts/advanced-search.js**
```javascript
async function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const sortBy = document.getElementById('sort-by').value;
    
    const params = new URLSearchParams({ category, minPrice, maxPrice, sortBy });
    const response = await fetch(`/api/analytics/search?${params}`);
    const products = await response.json();
    displayFilteredProducts(products);
}
```

**Backend: server/routes/analyticsRoutes.js**
```javascript
let query = `
    SELECT p.*, c.name AS category_name,
           GetProductAvgRating(p.id) AS avg_rating
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
`;

if (category) query += " AND c.name = ?";
if (minPrice) query += " AND p.price >= ?";
if (maxPrice) query += " AND p.price <= ?";
if (sortBy === 'price_asc') query += " ORDER BY p.price ASC";
```

**SQL Query Example:**
```sql
SELECT p.*, c.name AS category_name, GetProductAvgRating(p.id) AS avg_rating
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'Clothing' AND p.price >= 500 AND p.price <= 1500
ORDER BY p.price ASC;
```


---

### Feature 4: Shopping Cart

**SQL Concepts Used:** Session Storage (not SQL-based, uses Express sessions)

#### How It Works:

**Frontend: scripts/shop_app.js**
```javascript
// Add to cart
const productData = {
    productId, productName, productPrice, productImage, quantity: 1
};

await fetch("/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData)
});
```

**Backend: server/routes/pageRoutes.js**
```javascript
router.post('/cart/add', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    
    const existing = req.session.cart.find(i => i.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        req.session.cart.push({ id, name, price, image, quantity });
    }
    
    res.json({ success: true });
});
```

**Note:** Cart uses session storage, not database. When order is placed, it's saved to database.


---

### Feature 5: Product Reviews & Ratings

**SQL Concepts Used:** INSERT, SELECT with JOIN, Aggregate Functions (AVG, COUNT), GROUP BY

#### How It Works:

**1. Submit Review**

**Frontend: scripts/reviews.js**
```javascript
async function submitReview() {
    const reviewData = {
        userId: 1,
        productId: currentProductId,
        rating: parseInt(rating),
        reviewText: reviewText
    };
    
    await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
    });
}
```

**Backend: server/routes/reviewRoutes.js**
```javascript
await pool.execute(
    "INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES (?, ?, ?, ?)",
    [userId, productId, rating, reviewText]
);
```

**SQL Query:**
```sql
INSERT INTO reviews (user_id, product_id, rating, review_text) 
VALUES (1, 0, 5, 'Great product!');
```


**2. Load Product Reviews**

**Frontend:**
```javascript
const response = await fetch(`/api/reviews/product/${productId}`);
const data = await response.json();
// data contains: avgRating, totalReviews, reviews, ratingDistribution
```

**Backend:**
```javascript
// Get average rating using custom function
const [avgRating] = await pool.execute(
    "SELECT GetProductAvgRating(?) AS avg_rating",
    [productId]
);

// Get all reviews with user details (JOIN)
const [reviews] = await pool.execute(`
    SELECT r.*, u.name AS user_name,
           DATE_FORMAT(r.created_at, '%M %d, %Y') AS formatted_date
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
`, [productId]);

// Get rating distribution (GROUP BY)
const [distribution] = await pool.execute(`
    SELECT rating, COUNT(*) AS count
    FROM reviews
    WHERE product_id = ?
    GROUP BY rating
    ORDER BY rating DESC
`, [productId]);
```

**SQL Queries:**
```sql
-- Average rating
SELECT GetProductAvgRating(0) AS avg_rating;

-- All reviews
SELECT r.*, u.name AS user_name
FROM reviews r
JOIN users u ON r.user_id = u.id
WHERE r.product_id = 0;

-- Rating distribution
SELECT rating, COUNT(*) AS count
FROM reviews WHERE product_id = 0
GROUP BY rating;
```


---

### Feature 6: Order Placement

**SQL Concepts Used:** Stored Procedure, Transactions (TCL), UPDATE, INSERT

#### How It Works:

**Frontend:**
```javascript
async function placeOrder(userId, productId, quantity) {
    const response = await fetch('/api/orders/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity })
    });
    
    const result = await response.json();
    if (result.success) {
        alert(`Order placed! Order ID: ${result.orderId}`);
    }
}
```

**Backend: server/routes/orderRoutes.js**
```javascript
const [result] = await pool.execute(
    "CALL PlaceOrder(?, ?, ?)",
    [userId, productId, quantity]
);
```

**SQL Stored Procedure:**
```sql
CALL PlaceOrder(1, 0, 2);

-- Inside procedure:
START TRANSACTION;
    -- Check stock
    SELECT stock, price FROM products WHERE id = 0 FOR UPDATE;
    -- Create order
    INSERT INTO orders (user_id, total_amount) VALUES (1, 1798.00);
    -- Update stock
    UPDATE products SET stock = stock - 2 WHERE id = 0;
COMMIT;
```

**Benefits:**
- ✅ Transaction safety (ACID properties)
- ✅ Automatic stock management
- ✅ Rollback on insufficient stock


---

### Feature 7: User Dashboard

**SQL Concepts Used:** Views, Custom Functions, JOINs, Aggregate Functions

#### How It Works:

**Frontend:**
```javascript
async function loadUserDashboard(userId) {
    const response = await fetch(`/api/analytics/user-dashboard/${userId}`);
    const data = await response.json();
    
    // Display total spending
    document.getElementById('total-spending').textContent = `₹${data.totalSpending}`;
    
    // Display order count
    document.getElementById('order-count').textContent = data.orderSummary.total_orders;
    
    // Display recent orders
    data.recentOrders.forEach(order => {
        // Render order card
    });
}
```

**Backend: server/routes/analyticsRoutes.js**
```javascript
// Use custom function
const [spendingResult] = await pool.execute(
    "SELECT GetUserTotalSpending(?) AS total_spending",
    [userId]
);

// Use view
const [orderSummary] = await pool.execute(
    "SELECT * FROM user_order_summary WHERE user_id = ?",
    [userId]
);

// Get recent orders with JOIN
const [recentOrders] = await pool.execute(`
    SELECT o.id, o.total_amount, o.status, COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.order_date DESC
    LIMIT 5
`, [userId]);
```


**SQL Queries:**
```sql
-- Total spending (using function)
SELECT GetUserTotalSpending(1) AS total_spending;

-- Order summary (using view)
SELECT * FROM user_order_summary WHERE user_id = 1;

-- Recent orders (using JOIN and GROUP BY)
SELECT o.id, o.total_amount, o.status, COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 1
GROUP BY o.id
ORDER BY o.order_date DESC
LIMIT 5;
```

---

### Feature 8: Analytics Dashboard (Admin)

**SQL Concepts Used:** Views, Aggregate Functions, GROUP BY, HAVING, Multiple JOINs

#### How It Works:

**1. Revenue Statistics**

**Frontend:**
```javascript
const response = await fetch('/api/analytics/revenue-stats');
const data = await response.json();

document.getElementById('total-revenue').textContent = `₹${data.overall.total_revenue}`;
document.getElementById('total-orders').textContent = data.overall.total_orders;
```

**Backend:**
```javascript
// Overall revenue stats
const [overallStats] = await pool.execute(`
    SELECT COUNT(*) AS total_orders,
           SUM(total_amount) AS total_revenue,
           AVG(total_amount) AS avg_order_value
    FROM orders
    WHERE status = 'completed'
`);
```


**SQL Query:**
```sql
SELECT COUNT(*) AS total_orders,
       SUM(total_amount) AS total_revenue,
       AVG(total_amount) AS avg_order_value,
       MIN(total_amount) AS min_order,
       MAX(total_amount) AS max_order
FROM orders
WHERE status = 'completed';
```

**2. Top Rated Products**

**Backend:**
```javascript
const [products] = await pool.execute(
    "SELECT * FROM top_rated_products LIMIT 10"
);
```

**SQL Query (View):**
```sql
SELECT * FROM top_rated_products LIMIT 10;

-- View definition:
CREATE VIEW top_rated_products AS
SELECT p.id, p.name, p.price,
       AVG(r.rating) AS avg_rating,
       COUNT(r.id) AS review_count
FROM products p
INNER JOIN reviews r ON p.id = r.product_id
GROUP BY p.id
HAVING AVG(r.rating) >= 4.0
ORDER BY avg_rating DESC;
```

**3. Category Statistics**

**SQL Query:**
```sql
SELECT c.name AS category_name,
       COUNT(p.id) AS product_count,
       AVG(p.price) AS avg_price,
       MIN(p.price) AS min_price,
       MAX(p.price) AS max_price,
       SUM(p.stock) AS total_stock
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```


---

## 5. API Endpoints

### Authentication Endpoints

| Method | Endpoint | SQL Query | Purpose |
|--------|----------|-----------|---------|
| POST | `/auth/signup` | `INSERT INTO users` | Register new user |
| POST | `/auth/login` | `SELECT FROM users WHERE email` | User login |
| GET | `/auth/logout` | N/A (session destroy) | User logout |

### Product Endpoints

| Method | Endpoint | SQL Query | Purpose |
|--------|----------|-----------|---------|
| GET | `/api/products` | `SELECT * FROM products` | Get all products |
| GET | `/api/products/:id` | `SELECT FROM products WHERE id` | Get single product |

### Review Endpoints

| Method | Endpoint | SQL Query | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/reviews/add` | `INSERT INTO reviews` | Add product review |
| GET | `/api/reviews/product/:id` | Multiple (JOIN, GROUP BY, Function) | Get product reviews |
| GET | `/api/reviews/user/:id` | `SELECT with JOIN` | Get user's reviews |

### Order Endpoints

| Method | Endpoint | SQL Query | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/orders/place-order` | `CALL PlaceOrder()` | Place new order |
| GET | `/api/orders/:id` | `SELECT with JOINs` | Get order details |
| GET | `/api/orders/user/:id` | `SELECT with JOINs, GROUP BY` | Get user orders |


### Analytics Endpoints

| Method | Endpoint | SQL Query | Purpose |
|--------|----------|-----------|---------|
| GET | `/api/analytics/user-dashboard/:id` | View, Function, JOINs | User dashboard data |
| GET | `/api/analytics/search` | Complex WHERE, JOINs | Advanced product search |
| GET | `/api/analytics/top-rated-products` | View with HAVING | Top rated products |
| GET | `/api/analytics/revenue-stats` | Aggregate functions, JOINs | Revenue statistics |
| GET | `/api/analytics/category-stats` | GROUP BY, Aggregates | Category statistics |
| GET | `/api/analytics/premium-products` | Subquery | Products above avg price |

### Cart Endpoints (Session-based)

| Method | Endpoint | Storage | Purpose |
|--------|----------|---------|---------|
| GET | `/cart/json` | Session | Get cart items |
| POST | `/cart/add` | Session | Add item to cart |
| POST | `/cart/remove` | Session | Remove item from cart |
| POST | `/cart/clear` | Session | Clear cart |
| GET | `/cart` | Session | View cart page |

---

## 6. Frontend-Backend Flow

### Example: Adding a Product Review

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Fills review form
       │    Rating: 5 stars
       │    Text: "Great product!"
       │
       ▼
┌─────────────────────┐
│  reviews.js         │
│  (Frontend)         │
└──────┬──────────────┘
       │
       │ 2. submitReview()
       │    Collects: userId, productId, rating, reviewText
       │
       ▼
┌─────────────────────┐
│  fetch()            │
│  POST /api/reviews  │
│  /add               │
└──────┬──────────────┘
       │
       │ 3. HTTP Request
       │    Body: { userId: 1, productId: 0, rating: 5, reviewText: "..." }
       │
       ▼
```


```
┌─────────────────────┐
│  Express Server     │
│  reviewRoutes.js    │
└──────┬──────────────┘
       │
       │ 4. Validates data
       │    - Check userId exists
       │    - Check productId exists
       │    - Check rating 1-5
       │
       ▼
┌─────────────────────┐
│  MySQL Database     │
│  pool.execute()     │
└──────┬──────────────┘
       │
       │ 5. SQL Query
       │    INSERT INTO reviews (user_id, product_id, rating, review_text)
       │    VALUES (1, 0, 5, 'Great product!');
       │
       ▼
┌─────────────────────┐
│  Database           │
│  reviews table      │
└──────┬──────────────┘
       │
       │ 6. Row inserted
       │    id: 3 (auto-generated)
       │    user_id: 1
       │    product_id: 0
       │    rating: 5
       │    review_text: "Great product!"
       │    created_at: 2024-01-15 10:30:00
       │
       ▼
┌─────────────────────┐
│  Express Server     │
│  Response           │
└──────┬──────────────┘
       │
       │ 7. JSON Response
       │    { success: true, message: "Review added successfully" }
       │
       ▼
┌─────────────────────┐
│  Frontend           │
│  reviews.js         │
└──────┬──────────────┘
       │
       │ 8. Handle response
       │    - Show success alert
       │    - Clear form
       │    - Reload reviews
       │
       ▼
┌─────────────────────┐
│  User sees          │
│  "Review submitted  │
│   successfully!"    │
└─────────────────────┘
```


---

## 7. Key SQL Features Summary

### ✅ DDL (Data Definition Language)
- **CREATE TABLE** - 6 tables created
- **CREATE INDEX** - 2 indexes for performance
- **CREATE VIEW** - 4 views for simplified queries
- **PRIMARY KEY, FOREIGN KEY** - Referential integrity
- **CONSTRAINTS** - NOT NULL, UNIQUE, CHECK, DEFAULT

### ✅ DML (Data Manipulation Language)
- **INSERT** - User signup, reviews, orders
- **UPDATE** - Stock management, user profiles
- **DELETE** - Remove old data

### ✅ DQL (Data Query Language)
- **SELECT** - All data retrieval
- **WHERE** - Filtering
- **ORDER BY** - Sorting
- **LIMIT** - Pagination
- **DISTINCT** - Unique values

### ✅ TCL (Transaction Control Language)
- **START TRANSACTION** - Begin transaction
- **COMMIT** - Save changes
- **ROLLBACK** - Undo changes
- **FOR UPDATE** - Row locking

### ✅ Advanced Features
- **INNER JOIN, LEFT JOIN** - Combine tables
- **Subqueries** - Nested queries
- **Aggregate Functions** - COUNT, SUM, AVG, MIN, MAX
- **GROUP BY & HAVING** - Grouped filtering
- **Stored Procedures** - Reusable code (4 procedures)
- **Custom Functions** - User-defined functions (3 functions)
- **Views** - Virtual tables (4 views)


---

## 8. Project File Structure

```
ThriftSass/
├── server/
│   ├── app.js                      # Main server file
│   ├── config/
│   │   └── db.js                   # MySQL connection pool
│   ├── routes/
│   │   ├── authRoutes.js           # Authentication endpoints
│   │   ├── productRoutes.js        # Product endpoints
│   │   ├── reviewRoutes.js         # Review endpoints
│   │   ├── orderRoutes.js          # Order endpoints
│   │   ├── analyticsRoutes.js      # Analytics endpoints
│   │   └── pageRoutes.js           # Page & cart routes
│   └── views/
│       ├── home.ejs                # Homepage
│       ├── shop.ejs                # Shop page
│       ├── product.ejs             # Product detail page
│       ├── cart.ejs                # Cart page
│       ├── login.ejs               # Login page
│       └── signup.ejs              # Signup page
├── scripts/
│   ├── shop_app.js                 # Shop page logic
│   ├── product.js                  # Product page logic
│   ├── reviews.js                  # Review functionality
│   ├── cart.js                     # Cart functionality
│   ├── advanced-search.js          # Search filters
│   └── cart-manager.js             # Cart state management
├── database/
│   ├── schema.sql                  # Complete database schema
│   └── SQL_FEATURES_SUMMARY.md     # SQL features documentation
├── css/
│   └── [style files]
├── assets/
│   └── [images]
└── .env                            # Environment variables
```


---

## 9. Database Schema Details

### Table: users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Store user accounts
**Used in:** Authentication, orders, reviews

### Table: categories
```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
```
**Purpose:** Product categories
**Used in:** Product organization, filtering

### Table: products
```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    stock INT DEFAULT 0,
    type VARCHAR(50) DEFAULT 'regular',
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```
**Purpose:** Product catalog
**Used in:** Shop page, product details, orders


### Table: orders
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Purpose:** Customer orders
**Used in:** Order history, analytics

### Table: order_items
```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```
**Purpose:** Order line items
**Used in:** Order details, sales analytics

### Table: reviews
```sql
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
```
**Purpose:** Product reviews and ratings
**Used in:** Product page, analytics


---

## 10. Performance Optimizations

### Indexes
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_users_email ON users(email);
```

**Benefits:**
- ✅ Faster product filtering by category
- ✅ Faster user lookup by email (login)
- ✅ Improved JOIN performance

### Views
- Pre-computed JOINs for frequently accessed data
- Simplifies complex queries
- Reduces code duplication

### Connection Pooling
```javascript
const pool = mysql.createPool({
    connectionLimit: 10,
    waitForConnections: true
});
```

**Benefits:**
- ✅ Reuses database connections
- ✅ Handles concurrent requests efficiently
- ✅ Prevents connection exhaustion

---

## 11. Security Features

### Password Hashing
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```
- ✅ Passwords never stored in plain text
- ✅ Uses bcrypt with salt rounds

### SQL Injection Prevention
```javascript
await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
```
- ✅ Parameterized queries
- ✅ Input sanitization

### Session Management
```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
```
- ✅ Secure session storage
- ✅ Session expiration


---

## 12. Testing & Verification

### Test Database Setup
```bash
# In MySQL Workbench
source ThriftSass/database/schema.sql;
```

### Test API Endpoints
```javascript
// Test product fetch
fetch('/api/products').then(r => r.json()).then(console.log);

// Test review submission
fetch('/api/reviews/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 1, productId: 0, rating: 5, reviewText: 'Test'
    })
}).then(r => r.json()).then(console.log);

// Test search
fetch('/api/analytics/search?category=Clothing&minPrice=500')
    .then(r => r.json()).then(console.log);
```

### Verify Database
```sql
-- Check tables
SHOW TABLES;

-- Check data
SELECT * FROM products;
SELECT * FROM reviews;
SELECT * FROM orders;

-- Test functions
SELECT GetUserTotalSpending(1);
SELECT GetProductAvgRating(0);

-- Test views
SELECT * FROM product_details;
SELECT * FROM user_order_summary;
```

---

## 13. Conclusion

This project demonstrates comprehensive use of SQL concepts integrated with a modern web application:

✅ **All SQL command types** (DDL, DML, DQL, TCL)
✅ **Advanced features** (JOINs, Subqueries, Functions, Procedures, Views)
✅ **Real-world application** (E-commerce with authentication, cart, reviews)
✅ **Production-ready** (Security, performance, error handling)
✅ **Full-stack integration** (Frontend ↔ Backend ↔ Database)

---

**Project by:** ThriftSass Team
**Database:** MySQL
**Last Updated:** 2024
