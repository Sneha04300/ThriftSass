# 📚 ThriftSass Quick Reference Guide

## SQL Concepts → Features Mapping

### 1. DDL (Data Definition Language)
**What:** Define database structure
**Where Used:**
- Creating 6 tables (users, products, categories, orders, order_items, reviews)
- Creating 2 indexes for performance
- Creating 4 views for simplified queries

---

### 2. DML (Data Manipulation Language)
**What:** Manipulate data
**Where Used:**
- **INSERT:** User signup, adding reviews, placing orders
- **UPDATE:** Stock management in order placement
- **DELETE:** Removing old reviews (in stored procedure)

---

### 3. DQL (Data Query Language)
**What:** Retrieve data
**Where Used:**
- **SELECT:** All product listings, user data, order history
- **WHERE:** Filtering products by category, price
- **JOIN:** Combining products with categories, orders with users
- **ORDER BY:** Sorting products by price, reviews by date
- **LIMIT:** Pagination, top 10 products

---

### 4. TCL (Transaction Control Language)
**What:** Manage transactions
**Where Used:**
- **PlaceOrder Procedure:** Ensures order placement is atomic
- **START TRANSACTION, COMMIT, ROLLBACK:** Stock management safety

---

### 5. JOINS
**What:** Combine tables
**Where Used:**
- Product catalog with category names
- Order details with user information
- Reviews with user names
- Sales analytics with product and category data


---

### 6. Aggregate Functions
**What:** Calculate on multiple rows
**Where Used:**
- **COUNT:** Total products, orders, reviews
- **SUM:** Total revenue, user spending
- **AVG:** Average product rating, average order value
- **MIN/MAX:** Price ranges, order amounts

---

### 7. GROUP BY & HAVING
**What:** Group and filter grouped data
**Where Used:**
- Products per category
- Rating distribution (1-5 stars count)
- Revenue by category
- Categories with avg price > 700

---

### 8. Subqueries
**What:** Nested queries
**Where Used:**
- Premium products (above average price)
- Users who placed orders
- Products above category average

---

### 9. Stored Procedures
**What:** Reusable SQL code
**Where Used:**
- **PlaceOrder:** Order placement with transaction
- **AddNewUser:** Safe user registration
- **UpdateProductStock:** Stock management
- **DeleteOldReviews:** Data cleanup

---

### 10. Custom Functions
**What:** User-defined functions
**Where Used:**
- **GetUserTotalSpending:** Calculate user's total spending
- **GetProductAvgRating:** Get product average rating
- **IsProductInStock:** Check stock status

---

### 11. Views
**What:** Virtual tables
**Where Used:**
- **product_details:** Products with category names
- **user_order_summary:** User statistics
- **product_sales_summary:** Sales analytics
- **top_rated_products:** Products with rating ≥ 4.0
