const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  // Add these connection settings to prevent timeouts
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if can't connect
});

// Handle pool errors WITHOUT crashing the server
pool.on("error", (err, client) => {
  console.error("⚠️ Unexpected database error:", err.message);
  // Don't call process.exit() - just log the error
});

// Test the connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("💡 Make sure PostgreSQL is running!");
  } else {
    console.log("✅ Database connected successfully");
  }
});

module.exports = pool;