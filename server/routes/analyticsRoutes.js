const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ============================================
// USER DASHBOARD - Uses Views & Functions
// ============================================

// Get user dashboard data
router.get("/user-dashboard/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Use custom function to get total spending
        const [spendingResult] = await pool.execute(
            "SELECT GetUserTotalSpending(?) AS total_spending",
            [userId]
        );

        // Use view to get order summary
        const [orderSummary] = await pool.execute(
            "SELECT * FROM user_order_summary WHERE user_id = ?",
            [userId]
        );

        // Get recent orders with JOIN
        const [recentOrders] = await pool.execute(`
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.order_date,
                COUNT(oi.id) AS item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id, o.total_amount, o.status, o.order_date
            ORDER BY o.order_date DESC
            LIMIT 5
        `, [userId]);

        res.json({
            totalSpending: spendingResult[0].total_spending,
            orderSummary: orderSummary[0] || {},
            recentOrders: recentOrders
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Failed to load dashboard" });
    }
});

// ============================================
// PRODUCT ANALYTICS - Uses Views & Aggregate Functions
// ============================================

// Get top rated products (uses VIEW)
router.get("/top-rated-products", async (req, res) => {
    try {
        const [products] = await pool.execute(
            "SELECT * FROM top_rated_products LIMIT 10"
        );
        res.json(products);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load top rated products" });
    }
});

// Get product sales summary (uses VIEW)
router.get("/product-sales", async (req, res) => {
    try {
        const [sales] = await pool.execute(`
            SELECT * FROM product_sales_summary 
            ORDER BY total_revenue DESC 
            LIMIT 20
        `);
        res.json(sales);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load sales data" });
    }
});

// ============================================
// CATEGORY ANALYTICS - Uses GROUP BY & HAVING
// ============================================

// Get category statistics
router.get("/category-stats", async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                c.name AS category_name,
                COUNT(p.id) AS product_count,
                AVG(p.price) AS avg_price,
                MIN(p.price) AS min_price,
                MAX(p.price) AS max_price,
                SUM(p.stock) AS total_stock
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name
            ORDER BY product_count DESC
        `);
        res.json(stats);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load category stats" });
    }
});

// ============================================
// ADVANCED SEARCH - Uses Subqueries & Complex Queries
// ============================================

// Search products with filters
router.get("/search", async (req, res) => {
    try {
        const { category, minPrice, maxPrice, inStock, sortBy } = req.query;
        
        let query = `
            SELECT 
                p.*,
                c.name AS category_name,
                GetProductAvgRating(p.id) AS avg_rating,
                IsProductInStock(p.id) AS stock_status
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category) {
            query += " AND c.name = ?";
            params.push(category);
        }
        
        if (minPrice) {
            query += " AND p.price >= ?";
            params.push(minPrice);
        }
        
        if (maxPrice) {
            query += " AND p.price <= ?";
            params.push(maxPrice);
        }
        
        if (inStock === 'true') {
            query += " AND p.stock > 0";
        }
        
        // Sorting
        if (sortBy === 'price_asc') {
            query += " ORDER BY p.price ASC";
        } else if (sortBy === 'price_desc') {
            query += " ORDER BY p.price DESC";
        } else if (sortBy === 'rating') {
            query += " ORDER BY avg_rating DESC";
        } else {
            query += " ORDER BY p.id";
        }
        
        const [products] = await pool.execute(query, params);
        res.json(products);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Search failed" });
    }
});

// ============================================
// REVENUE ANALYTICS - Uses Aggregate Functions
// ============================================

// Get revenue statistics
router.get("/revenue-stats", async (req, res) => {
    try {
        // Overall revenue stats
        const [overallStats] = await pool.execute(`
            SELECT 
                COUNT(*) AS total_orders,
                SUM(total_amount) AS total_revenue,
                AVG(total_amount) AS avg_order_value,
                MIN(total_amount) AS min_order,
                MAX(total_amount) AS max_order
            FROM orders
            WHERE status = 'completed'
        `);

        // Revenue by category (uses JOIN & GROUP BY)
        const [categoryRevenue] = await pool.execute(`
            SELECT 
                c.name AS category,
                COUNT(DISTINCT oi.order_id) AS order_count,
                SUM(oi.quantity * oi.price_at_purchase) AS revenue
            FROM categories c
            JOIN products p ON c.id = p.category_id
            JOIN order_items oi ON p.id = oi.product_id
            GROUP BY c.id, c.name
            ORDER BY revenue DESC
        `);

        res.json({
            overall: overallStats[0],
            byCategory: categoryRevenue
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load revenue stats" });
    }
});

// ============================================
// COMPARISON QUERIES - Uses Subqueries
// ============================================

// Get products above average price
router.get("/premium-products", async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT 
                p.name,
                p.price,
                c.name AS category,
                (SELECT AVG(price) FROM products) AS avg_price
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.price > (SELECT AVG(price) FROM products)
            ORDER BY p.price DESC
        `);
        res.json(products);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load premium products" });
    }
});

module.exports = router;
