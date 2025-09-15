import express from "express";
import cors from "cors";
import helmet from "helmet";

import gamesRouter from "./routes/games";
import leaderboardRouter from "./routes/leaderboard";

export const app = express();

app.use(helmet());

// ✅ Allow frontend origins explicitly
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://stacksplays-frontend.vercel.app", // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routers
app.use("/api/games", gamesRouter);
app.use("/api/leaderboard", leaderboardRouter);

// Default root
app.get("/", (_req, res) => {
  res.send("StacksPlays Backend is running 🚀 Try /health");
});