// ---------------- IMPORTS ----------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // For password hashing
require("dotenv").config(); // Load .env

// Import User model
const User = require("./models/User");

// ---------------- INIT APP ----------------
const app = express();
app.use(cors());
app.use(express.json());

console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);

// ---------------- CONNECT MONGODB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------- REGISTER API ----------------
app.post("/register", async (req, res) => {
  try {
    const { userId, password } = req.body;
    console.log("Register request body:", req.body);

    if (!userId || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({ userId, password: hashedPassword });
    await user.save();
    console.log("User saved:", user);

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ---------------- LOGIN API ----------------
app.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    console.log("Login request body:", req.body);

    if (!userId || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
