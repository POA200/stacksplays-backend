import { Router } from "express";
import { z } from "zod";
import { getLeaderboard, upsertScore, Period } from "../services/leaderboard.services";
import { requireAdmin } from "../middleware/admin";

const router = Router();

const Query = z.object({
  period: z.enum(["daily", "weekly", "season"]).default("season"),
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(50),
});

router.get("/", (req, res) => {
  const { period, offset, limit } = Query.parse(req.query);
  return res.json(getLeaderboard(period as Period, offset, limit));
});

// (Optional) protected submit. Remove requireAdmin if you post from client.
const Body = z.object({
  period: z.enum(["daily", "weekly", "season"]),
  userId: z.string().min(1),
  address: z.string().min(3),
  bns: z.string().optional(),
  avatar: z.string().optional(),
  points: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative().optional(),
  streak: z.number().int().nonnegative().optional(),
});

router.post("/submit", requireAdmin, (req, res) => {
  const body = Body.parse(req.body);
  upsertScore(body.period, {
    userId: body.userId,
    address: body.address,
    bns: body.bns,
    avatar: body.avatar,
    points: body.points,
    wins: body.wins,
    streak: body.streak,
  });
  return res.json({ ok: true });
});

export default router;