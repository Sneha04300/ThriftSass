const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");

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

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =========================
// MongoDB Connection
// =========================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB connected"))
    .catch((err) => console.log(" DB connection failed:", err));

// =========================
// Routes
// =========================
const productRoutes = require("./routes/productRoutes");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes"); // NEW

// API routes
app.use("/api/products", productRoutes);

// Auth routes (Login + Signup + Logout)
app.use("/auth", authRoutes);

// Frontend page routes
app.use("/", pageRoutes);

// =========================
// Server Start
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
