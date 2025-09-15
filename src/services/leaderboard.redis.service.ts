
import { redis } from "../redis";

export type Period = "daily" | "weekly" | "season";
export type LeaderRow = {
  userId: string;
  bns?: string;
  address: string;
  avatar?: string;
  points: number;
  wins?: number;
  streak?: number;
  updatedAt: number;
};

const keyZ = (p: Period) => `lb:${p}:points`;
const keyUser = (id: string) => `lb:user:${id}`;

// Optional: metadata shape you store per user
export type UserMeta = {
  bns?: string;
  address: string;       // recommended to store
  avatar?: string;
  wins?: number;
  streak?: number;
};

// --- ADD THIS: upsertScore (increment points + update user meta) ---
export async function upsertScore(
  period: Period,
  userId: string,
  deltaPoints: number,
  meta?: UserMeta
) {
  // increment points in the zset for this period
  const newScore = await redis.zIncrBy(keyZ(period), deltaPoints, userId);

  // always bump updatedAt; optionally store/merge metadata
  const h: Record<string, string> = { updatedAt: String(Date.now()) };
  if (meta?.address) h.address = meta.address;
  if (meta?.bns) h.bns = meta.bns;
  if (meta?.avatar) h.avatar = meta.avatar;
  if (typeof meta?.wins === "number") h.wins = String(meta.wins);
  if (typeof meta?.streak === "number") h.streak = String(meta.streak);

  if (Object.keys(h).length) {
    await redis.hSet(keyUser(userId), h);
  }

  return { userId, score: Number(newScore) };
}

// --- ADD THIS: resetPeriod (clear the zset for a period) ---
export async function resetPeriod(period: Period) {
  // Clears only the leaderboard for that period
  // (user hashes are left intact)
  await redis.del(keyZ(period));
  return { ok: true };
}

/** Get a paged slice with ranks computed (desc by points) */
export async function getPage(period: Period, offset = 0, limit = 25) {
  const start = offset;
  const stop = offset + limit - 1;

  const [ids, total] = await Promise.all([
    redis.zRange(keyZ(period), start, stop, { REV: true }),
    redis.zCard(keyZ(period)),
  ]);

  if (ids.length === 0) {
    return { total, rows: [] as Array<LeaderRow & { rank: number }> };
  }

  // Make types explicit so TS is happy
  const [scores, metas] = await Promise.all([
    redis.zMScore(keyZ(period), ids) as Promise<(number | null)[]>,
    Promise.all(
      ids.map((id) => redis.hGetAll(keyUser(id)) as Promise<Record<string, string>>)
    ),
  ]);

  const rows = ids.map((id, i) => {
    const meta = metas[i] || {};
    const rank = offset + i + 1;
    const points = Number(scores[i] ?? meta.points ?? 0);

    return {
      rank,
      userId: id,
      bns: meta.bns,
      address: meta.address || "",
      avatar: meta.avatar,
      points,
      wins: meta.wins ? Number(meta.wins) : undefined,
      streak: meta.streak ? Number(meta.streak) : undefined,
      updatedAt: meta.updatedAt ? Number(meta.updatedAt) : 0,
    };
  });

  return { total, rows };
}

/** Get a user's rank and meta for a period */
export async function getRank(period: Period, userId: string) {
  const rank0 = await redis.zRevRank(keyZ(period), userId);
  if (rank0 === null) return null;

  const [score, meta] = await Promise.all([
    redis.zScore(keyZ(period), userId), // number | null
    redis.hGetAll(keyUser(userId)) as Promise<Record<string, string>>,
  ]);

  return {
    rank: rank0 + 1,
    userId,
    bns: meta.bns,
    address: meta.address || "",
    avatar: meta.avatar,
    points: Number(score ?? meta.points ?? 0),
    wins: meta.wins ? Number(meta.wins) : undefined,
    streak: meta.streak ? Number(meta.streak) : undefined,
    updatedAt: meta.updatedAt ? Number(meta.updatedAt) : 0,
  };
}

/** Get a small slice around a user (±radius ranks) */
export async function aroundMe(period: Period, userId: string, radius = 3) {
  const rank0 = await redis.zRevRank(keyZ(period), userId);
  if (rank0 === null) return { rows: [] as Array<LeaderRow & { rank: number }>, rank: null };

  const start = Math.max(0, rank0 - radius);
  const stop = rank0 + radius;

  const ids = await redis.zRange(keyZ(period), start, stop, { REV: true });

  const [scores, metas] = await Promise.all([
    redis.zMScore(keyZ(period), ids) as Promise<(number | null)[]>,
    Promise.all(
      ids.map((id) => redis.hGetAll(keyUser(id)) as Promise<Record<string, string>>)
    ),
  ]);

  const rows = ids.map((id, i) => {
    const meta = metas[i] || {};
    const rank = start + i + 1;
    const points = Number(scores[i] ?? meta.points ?? 0);
    return {
      rank,
      userId: id,
      bns: meta.bns,
      address: meta.address || "",
      avatar: meta.avatar,
      points,
      wins: meta.wins ? Number(meta.wins) : undefined,
      streak: meta.streak ? Number(meta.streak) : undefined,
      updatedAt: meta.updatedAt ? Number(meta.updatedAt) : 0,
    };
  });

  return { rows, rank: rank0 + 1 };
}