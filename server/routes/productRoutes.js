const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Helper to load products.json
function loadProducts() {
  const file = path.join(__dirname, "..", "..", "products.json");
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}

// GET /api/products -> return all products
router.get("/", (req, res) => {
  try {
    const products = loadProducts();
    res.json(products);
  } catch (err) {
    console.error("Error reading products.json:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// GET /api/products/:id -> return single product by id
router.get("/:id", (req, res) => {
  try {
    const products = loadProducts();
    const id = Number(req.params.id);
    const product = products.find(p => Number(p.id) === id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error reading products.json:", err);
    res.status(500).json({ error: "Failed to load product" });
  }
});

module.exports = router;
