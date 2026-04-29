const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/products -> return all products
router.get("/", async (req, res) => {
    try {
        const [products] = await pool.execute("SELECT * FROM products");
        res.json(products);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to load products" });
    }
});

// GET /api/products/:id -> return single product by id
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [products] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json(products[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to load product" });
    }
});

module.exports = router;
