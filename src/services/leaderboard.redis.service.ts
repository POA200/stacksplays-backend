import Redis from "ioredis";

// Initialize the Redis client using ioredis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",  // Redis host
  port: Number(process.env.REDIS_PORT || 6379), // Redis port
  password: process.env.REDIS_PASSWORD,        // Redis password, if any
});

export type Period = "daily" | "weekly" | "season";

// Leaderboard row type
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

// Redis key generation for leaderboard data
const keyZ = (p: Period) => `lb:${p}:points`;
const keyUser = (id: string) => `lb:user:${id}`;

// Metadata that is optional per user
export type UserMeta = {
  bns?: string;
  address: string; // always store user address
  avatar?: string;
  wins?: number;
  streak?: number;
};

// Increment score in leaderboard and update user metadata
export async function upsertScore(
  period: Period,
  userId: string,
  deltaPoints: number,
  meta?: UserMeta
) {
  // Increment user's points in the sorted set (zset)
  const newScore = await redis.zincrby(keyZ(period), deltaPoints, userId);

  // Create metadata object for user
  const h: Record<string, string> = { updatedAt: String(Date.now()) };
  if (meta?.address) h.address = meta.address;
  if (meta?.bns) h.bns = meta.bns;
  if (meta?.avatar) h.avatar = meta.avatar;
  if (meta?.wins !== undefined) h.wins = String(meta.wins);
  if (meta?.streak !== undefined) h.streak = String(meta.streak);

  // Update metadata (user hash) if needed
  if (Object.keys(h).length) {
    await redis.hset(keyUser(userId), h);
  }

  return { userId, score: Number(newScore) };
}

// Reset leaderboard for a given period
export async function resetPeriod(period: Period) {
  await redis.del(keyZ(period));  // Clear leaderboard data for the given period
  return { ok: true };
}

/** Get a paged slice with ranks computed (desc by points) */
export async function getPage(period: Period, offset = 0, limit = 25) {
  const start = offset;
  const stop = offset + limit - 1;

  const [ids, total] = await Promise.all([
    redis.zrange(keyZ(period), start, stop, "REV"),
    redis.zcard(keyZ(period)),
  ]);

  if (ids.length === 0) {
    return { total, rows: [] as Array<LeaderRow & { rank: number }> };
  }

  // Retrieve scores and metadata for the leaderboard slice
  const [scores, metas] = await Promise.all([
    redis.zmscore(keyZ(period), ids) as Promise<(number | null)[]>,
    Promise.all(
      ids.map((id) => redis.hgetall(keyUser(id)) as Promise<Record<string, string>>)
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

/** Get a user's rank and metadata for a period */
export async function getRank(period: Period, userId: string) {
  const rank0 = await redis.zrevrank(keyZ(period), userId);
  if (rank0 === null) return null;

  const [score, meta] = await Promise.all([
    redis.zscore(keyZ(period), userId), // number | null
    redis.hgetall(keyUser(userId)) as Promise<Record<string, string>>,
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
  const rank0 = await redis.zrevrank(keyZ(period), userId);
  if (rank0 === null) return { rows: [] as Array<LeaderRow & { rank: number }>, rank: null };

  const start = Math.max(0, rank0 - radius);
  const stop = rank0 + radius;

  const ids = await redis.zrange(keyZ(period), start, stop, "REV");

  const [scores, metas] = await Promise.all([
    redis.zmscore(keyZ(period), ids) as Promise<(number | null)[]>,
    Promise.all(
      ids.map((id) => redis.hgetall(keyUser(id)) as Promise<Record<string, string>>)
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