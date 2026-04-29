const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ============================================
// PLACE ORDER - Uses Stored Procedure with Transaction
// ============================================

// Place a new order using stored procedure
router.post("/place-order", async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Call stored procedure (includes transaction management)
        const [result] = await pool.execute(
            "CALL PlaceOrder(?, ?, ?)",
            [userId, productId, quantity]
        );

        // Result is in the first element
        const orderResult = result[0][0];

        if (orderResult.order_id > 0) {
            res.json({
                success: true,
                message: orderResult.message,
                orderId: orderResult.order_id
            });
        } else {
            res.status(400).json({
                success: false,
                message: orderResult.message
            });
        }
    } catch (err) {
        console.error("Order placement error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to place order"
        });
    }
});

// ============================================
// GET ORDER DETAILS - Uses JOINs
// ============================================

// Get order details with all items
router.get("/:orderId", async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Get order with user details (JOIN)
        const [orderInfo] = await pool.execute(`
            SELECT 
                o.*,
                u.name AS customer_name,
                u.email AS customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [orderId]);

        if (orderInfo.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Get order items with product details (Multiple JOINs)
        const [orderItems] = await pool.execute(`
            SELECT 
                oi.*,
                p.name AS product_name,
                p.image_url,
                c.name AS category_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.json({
            order: orderInfo[0],
            items: orderItems
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load order details" });
    }
});

// ============================================
// GET USER ORDERS - Uses JOINs & Aggregates
// ============================================

// Get all orders for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const [orders] = await pool.execute(`
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.order_date,
                COUNT(oi.id) AS item_count,
                GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id, o.total_amount, o.status, o.order_date
            ORDER BY o.order_date DESC
        `, [userId]);

        res.json(orders);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load orders" });
    }
});

module.exports = router;
