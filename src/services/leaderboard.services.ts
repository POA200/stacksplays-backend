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

const store: Record<Period, LeaderRow[]> = {
  daily: [],
  weekly: [],
  season: [],
};

export function upsertScore(period: Period, row: Omit<LeaderRow, "updatedAt">) {
  const list = store[period];
  const idx = list.findIndex(r => r.userId === row.userId);
  if (idx >= 0) list[idx] = { ...list[idx], ...row, updatedAt: Date.now() };
  else list.push({ ...row, updatedAt: Date.now() });
}

export function getLeaderboard(period: Period, offset = 0, limit = 50) {
  const sorted = [...store[period]].sort(
    (a, b) => b.points - a.points || (b.wins ?? 0) - (a.wins ?? 0)
  );
  const withRank = sorted.map((r, i) => ({ rank: i + 1, ...r }));
  return {
    total: withRank.length,
    rows: withRank.slice(offset, offset + limit),
  };
}

// seed some demo data
(function seed() {
  upsertScore("season", { userId: "1", bns: "StacksPlays.btc", address: "sp…111", avatar: "/StacksplaysPunk.png", points: 1240, wins: 12, streak: 3 });
  upsertScore("season", { userId: "2", bns: "alpha.btc", address: "sp…222", points: 980, wins: 9, streak: 1 });
  upsertScore("season", { userId: "3", bns: "beta.btc", address: "sp…333", points: 760, wins: 6, streak: 2 });
})();