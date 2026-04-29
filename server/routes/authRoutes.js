const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Signup POST
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check existing user
        const [existingUsers] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        res.redirect("/login");
    } catch (err) {
        console.log(err);
        res.send("Error in signup");
    }
});

// Login POST
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.send("User not found");
        }
        const user = users[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.send("Incorrect password");

        // Save user session
        req.session.user = { id: user.id, name: user.name, email: user.email };
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.send("Error during login");
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

module.exports = router;
