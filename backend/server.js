const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Serve static files (images)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "CookMate API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
console.log("📦 Loading routes...");
const authRoutes = require("./routes/auth");
console.log("✅ Auth routes loaded");

const preferenceRoutes = require("./routes/preferences");
console.log("✅ Preference routes loaded");

const recipeRoutes = require("./routes/recipes");
console.log("✅ Recipe routes loaded");

const ratingRoutes = require("./routes/ratings");
      console.log("✅ Rating routes loaded");

// ⚠️ This is where it might fail
try {
  const groceryRoutes = require("./routes/grocery");
  console.log("✅ Grocery routes loaded");

  // Use routes
  app.use("/api/auth", authRoutes);
  app.use("/api/preferences", preferenceRoutes);
  app.use("/api/recipes", recipeRoutes);
  app.use("/api/grocery", groceryRoutes);
  app.use("/api/ratings", ratingRoutes);

  console.log("✅ All routes registered!");
} catch (error) {
  console.error("❌ ERROR loading grocery routes:", error.message);
  console.error("Stack:", error.stack);
}



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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`💡 Find your IP with:`);
  console.log(`   Windows: ipconfig`);
  console.log(`   Mac/Linux: ifconfig`);
  console.log(`\n✅ Backend ready!`);
});

module.exports = app;