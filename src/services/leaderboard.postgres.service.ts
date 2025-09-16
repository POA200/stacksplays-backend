// src/services/leaderboard-postgres.service.ts
import { pool } from "../postgres";

export type Period = "daily" | "weekly" | "season";

export async function upsertScore(
  period: Period,
  userId: string,
  points: number,
  meta: { address: string; bns?: string; avatar?: string; wins?: number; streak?: number }
) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO leaderboard (period, user_id, points, address, bns, avatar, wins, streak, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (period, user_id)
       DO UPDATE SET points = leaderboard.points + EXCLUDED.points, updated_at = NOW()`,
      [period, userId, points, meta.address, meta.bns, meta.avatar, meta.wins, meta.streak]
    );
  } finally {
    client.release();
  }
}

export async function getPage(period: Period, offset = 0, limit = 25) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT user_id, points, address, bns, avatar, wins, streak, updated_at
       FROM leaderboard
       WHERE period = $1
       ORDER BY points DESC
       OFFSET $2 LIMIT $3`,
      [period, offset, limit]
    );
    return { total: result.rowCount, rows: result.rows };
  } finally {
    client.release();
  }
}

export async function getRank(period: Period, userId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT user_id, points, RANK() OVER (ORDER BY points DESC) as rank
       FROM leaderboard WHERE period = $1`,
      [period]
    );
    return result.rows.find((row) => row.user_id === userId) || null;
  } finally {
    client.release();
  }
}