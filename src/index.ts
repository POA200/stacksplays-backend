import express from "express";
import dotenv from "dotenv";
import { ensurePostgres } from "./postgres"; // Ensure to use your postgres connection logic

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => res.json({ ok: true }));

// Connect to PostgreSQL before starting the server
async function main() {
  await ensurePostgres(); // This ensures you're connected to PostgreSQL
  app.listen(PORT, () => {
    console.log(`✅ API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});