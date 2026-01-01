const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "CookMate API is running!" });
});

// Import routes
const authRoutes = require("./routes/auth");
const preferenceRoutes = require("./routes/preferences");

// Use routes - IMPORTANT: /api prefix is added here!
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferenceRoutes);

// 404 handler
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.path);
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;