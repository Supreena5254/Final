const pool = require("./config/db");

async function checkTables() {
  try {
    console.log("🔍 Checking database tables...\n");

    // Check what tables exist
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
      console.log("❌ No tables found in database!");
      console.log("💡 You need to create the tables first.\n");
    } else {
      console.log("✅ Found tables:");
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log();
    }

    // Check users table structure
    const usersCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users'
    `);

    if (usersCheck.rows.length > 0) {
      console.log("✅ 'users' table exists");

      // Show columns
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      console.log("\n📋 Users table structure:");
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
      });
    } else {
      console.log("❌ 'users' table does NOT exist");
      console.log("💡 Run the SQL script to create tables");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkTables();