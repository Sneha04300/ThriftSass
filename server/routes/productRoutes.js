const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/products -> return all products
router.get("/", async (req, res) => {
    try {
        const [products] = await pool.execute("SELECT * FROM products");
        
        // Fix image URLs - encode spaces and special characters
        const fixedProducts = products.map(product => ({
            ...product,
            image_url: product.image_url ? encodeURI(product.image_url) : null,
            image: product.image_url ? encodeURI(product.image_url) : null // Add 'image' field for compatibility
        }));
        
        res.json(fixedProducts);
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
        
        // Fix image URL
        const product = products[0];
        product.image_url = product.image_url ? encodeURI(product.image_url) : null;
        product.image = product.image_url; // Add 'image' field for compatibility
        
        res.json(product);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to load product" });
    }
});

module.exports = router;
