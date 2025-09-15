import { Router } from "express";
import { z } from "zod";
import { upsertScore, getPage, aroundMe, getRank, resetPeriod, Period } from "../services/leaderboard.redis.service";

const router = Router();

const Query = z.object({
  period: z.enum(["daily", "weekly", "season"]).default("season"),
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(25),
});

router.get("/", async (req, res) => {
  const { period, offset, limit } = Query.parse(req.query);
  const data = await getPage(period as Period, offset, limit);
  return res.json(data);
});

router.get("/me", async (req, res) => {
  const Q = z.object({
    period: z.enum(["daily", "weekly", "season"]).default("season"),
    userId: z.string().min(1),
    radius: z.coerce.number().min(1).max(10).default(3),
  }).parse(req.query);

  const [me, slice] = await Promise.all([
    getRank(Q.period, Q.userId),
    aroundMe(Q.period, Q.userId, Q.radius),
  ]);

  return res.json({ me, ...slice });
});

// keep protected in prod
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
  await upsertScore(b.period, b.userId, b.points, {
    address: b.address,
    bns: b.bns,
    avatar: b.avatar,
    wins: b.wins,
    streak: b.streak,
  });
  return res.json({ ok: true });
});

// optional admin reset endpoint (e.g., reset daily)
router.post("/reset", async (req, res) => {
  const Q = z.object({ period: z.enum(["daily", "weekly", "season"]) }).parse(req.query);
  await resetPeriod(Q.period);
  return res.json({ ok: true });
});

export default router;