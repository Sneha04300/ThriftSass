const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const pool = require("./config/db");

dotenv.config();
const app = express();

// =========================
// Middleware
// =========================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || "a-very-strong-secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

// Serve static folders
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/scripts", express.static(path.join(__dirname, "..", "scripts")));
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));
app.use("/node_modules", express.static(path.join(__dirname, "..", "node_modules")));

// Serve test-images.html for diagnostics
app.get("/test-images.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "test-images.html"));
});

// Serve test-review.html for testing reviews
app.get("/test-review.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "test-review.html"));
});

// Serve test-cart.html for cart diagnostics
app.get("/test-cart.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "test-cart.html"));
});

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =========================
// MySQL Database Connection
// =========================
pool.getConnection()
    .then((connection) => {
        console.log("✅ MySQL Database connected");
        connection.release();
    })
    .catch((err) => {
        console.log("❌ MySQL connection failed:", err);
    });

// =========================
// Routes
// =========================
const productRoutes = require("./routes/productRoutes");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// API routes
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Auth routes (Login + Signup + Logout)
app.use("/auth", authRoutes);

// Frontend page routes
app.use("/", pageRoutes);

// =========================
// Server Start
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
