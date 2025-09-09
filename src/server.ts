import express from "express";
import cors from "cors";
import helmet from "helmet";

import gamesRouter from "./routes/games";
import leaderboardRouter from "./routes/leaderboard";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// routers
app.use("/api/games", gamesRouter);
app.use("/api/leaderboard", leaderboardRouter);

// default root
app.get("/", (_req, res) => {
  res.send("StacksPlays Backend is running 🚀  Try /health");
});