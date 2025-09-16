import { Router } from "express";
import { z } from "zod";
import { upsertScore, getPage, getRank } from "../services/leaderboard.postgres.service";

const router = Router();

const Query = z.object({
  period: z.enum(["daily", "weekly", "season"]).default("season"),
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(25),
});

router.get("/", async (req, res) => {
  const { period, offset, limit } = Query.parse(req.query);
  const data = await getPage(period, offset, limit);
  res.json(data);
});

router.get("/me", async (req, res) => {
  const Q = z.object({
    period: z.enum(["daily", "weekly", "season"]).default("season"),
    userId: z.string().min(1),
  }).parse(req.query);

  const me = await getRank(Q.period, Q.userId);
  res.json({ me });
});

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

router.post("/submit", async (req, res) => {
  const b = Body.parse(req.body);
  await upsertScore(b.period, b.userId, b.points, b);
  res.json({ ok: true });
});

export default router;