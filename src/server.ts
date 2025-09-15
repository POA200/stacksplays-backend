import express from "express";
import cors from "cors";
import helmet from "helmet";

import gamesRouter from "./routes/games";          // ✅
import leaderboardRouter from "./routes/leaderboard";  // ✅

export const app = express();

app.use(helmet());

// Allow multiple origins
const allowedOrigins = [
  "https://stacksplays-frontend.vercel.app",
  "https://stacksplays-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
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

app.use(express.json());

// ✅ Debug log
console.log("gamesRouter:", typeof gamesRouter);
console.log("leaderboardRouter:", typeof leaderboardRouter);

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routers
app.use("/api/games", gamesRouter);
app.use("/api/leaderboard", leaderboardRouter);

// Root
app.get("/", (_req, res) => {
  res.send("StacksPlays Backend is running 🚀 Try /health");
});