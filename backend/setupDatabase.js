const pool = require("./config/db");

async function setupDatabase() {
  try {
    console.log("🚀 Setting up database...\n");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created 'users' table");

    // Create user_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        diet_type VARCHAR(50),
        allergies TEXT[],
        cuisines TEXT[],
        skill_level VARCHAR(50),
        meal_goal VARCHAR(100),
        health_goal VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created 'user_preferences' table");

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON user_preferences(user_id);
    `);
    console.log("✅ Created indexes");

    // Verify tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\n📋 Database tables:");
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log("\n✅ Database setup complete!");

  } catch (err) {
    console.error("❌ Setup error:", err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();