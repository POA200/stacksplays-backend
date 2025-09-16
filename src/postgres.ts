// src/postgres.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in .env file");
}

// Create a connection pool (use SSL in production)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Enable SSL in production only
});

// Test connection
export async function ensurePostgres() {
  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL");
    client.release(); // Release back to the pool
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error);
    process.exit(1); // Exit if there's an error
  }
}