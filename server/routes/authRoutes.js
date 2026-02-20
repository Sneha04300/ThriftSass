const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Signup POST
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword
        });

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

        const user = await User.findOne({ email });
        if (!user) return res.send("User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Incorrect password");

        // Save user session
        req.session.user = user;
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
