require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS connected_at"
    );

    console.log("Connected to Neon successfully!");
    console.log("Database:", result.rows[0].database);
    console.log("Time:", result.rows[0].connected_at);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
