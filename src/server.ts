import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import gamesRouter from "./routes/games";
import leaderboardRouter from "./routes/leaderboard";
import { ensurePostgres } from "./postgres"; // Import the PostgreSQL connection helper

dotenv.config();  // Load environment variables from .env file

export const app = express();

// Security middleware
app.use(helmet());

// CORS Setup for multiple origins (local and Vercel prod)
const allowedOrigins = [
  "http://localhost:5173",  // Dev environment
  "https://stacksplays-frontend.vercel.app",  // Production environment on Vercel
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    credentials: true,
  })
);

// Ensure PostgreSQL connection before starting the server
app.use(async (_req, _res, next) => {
  await ensurePostgres();
  next();
});

// Health check route
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Routers
app.use("/api/games", gamesRouter);
app.use("/api/leaderboard", leaderboardRouter);

// Default root route
app.get("/", (_req, res) => {
  res.send("StacksPlays Backend is running 🚀 Try /health");
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});