const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ============================================
// ADD REVIEW
// ============================================

// Add a product review
router.post("/add", async (req, res) => {
    try {
        const { userId, productId, rating, reviewText } = req.body;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        await pool.execute(
            "INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES (?, ?, ?, ?)",
            [userId, productId, rating, reviewText]
        );

        res.json({ success: true, message: "Review added successfully" });
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Failed to add review" });
    }
});

// ============================================
// GET PRODUCT REVIEWS - Uses JOINs & Custom Function
// ============================================

// Get all reviews for a product
router.get("/product/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;

        // Get average rating using custom function
        const [avgRating] = await pool.execute(
            "SELECT GetProductAvgRating(?) AS avg_rating",
            [productId]
        );

        // Get all reviews with user details (JOIN)
        const [reviews] = await pool.execute(`
            SELECT 
                r.*,
                u.name AS user_name,
                DATE_FORMAT(r.created_at, '%M %d, %Y') AS formatted_date
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [productId]);

        // Get rating distribution (GROUP BY)
        const [distribution] = await pool.execute(`
            SELECT 
                rating,
                COUNT(*) AS count
            FROM reviews
            WHERE product_id = ?
            GROUP BY rating
            ORDER BY rating DESC
        `, [productId]);

        res.json({
            avgRating: avgRating[0].avg_rating,
            totalReviews: reviews.length,
            reviews: reviews,
            ratingDistribution: distribution
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load reviews" });
    }
});

// ============================================
// GET USER REVIEWS
// ============================================

// Get all reviews by a user
router.get("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const [reviews] = await pool.execute(`
            SELECT 
                r.*,
                p.name AS product_name,
                p.image_url,
                DATE_FORMAT(r.created_at, '%M %d, %Y') AS formatted_date
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);

        res.json(reviews);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to load user reviews" });
    }
});

module.exports = router;
