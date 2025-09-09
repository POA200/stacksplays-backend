import { Router } from "express";
import { z } from "zod";
import { getGame, upsertGame, computeState } from "../services/game.services";
import { requireAdmin } from "../middleware/admin";

const router = Router();
const IdParams = z.object({ id: z.string().min(1) });

/** Public: get a game's state */
router.get("/:id", (req, res) => {
  const { id } = IdParams.parse(req.params);
  const game = getGame(id);
  if (!game) return res.status(404).json({ error: "Not found" });
  return res.json({ ...game, ...computeState(game) });
});

/** Admin: reset schedule (open now, close in 7 days) */
router.post("/:id/reset", requireAdmin, (req, res) => {
  const { id } = IdParams.parse(req.params);
  const now = Date.now();
  const game = upsertGame(id, { opensAt: now, closesAt: now + 7 * 24 * 3600_000 });
  return res.json({ ok: true, ...game, ...computeState(game) });
});

/** Admin: set custom opensAt/closesAt (ms) */
router.post("/:id/schedule", requireAdmin, (req, res) => {
  const body = z.object({
    opensAt: z.number().int().nonnegative(),
    closesAt: z.number().int().nonnegative(),
  }).parse(req.body);

  if (body.closesAt <= body.opensAt) {
    return res.status(400).json({ error: "closesAt must be > opensAt" });
  }

  const { id } = IdParams.parse(req.params);
  const game = upsertGame(id, body);
  return res.json({ ok: true, ...game, ...computeState(game) });
});

export default router;