// Absolute timestamps (ms) for open/close windows.
// Replace with a DB later if needed.

export type Game = {
  id: string;
  opensAt: number;   // ms UTC
  closesAt: number;  // ms UTC
};

const store: Record<string, Game> = {
  "word-search": {
    id: "word-search",
    opensAt: Date.now(),                     // open now
    closesAt: Date.now() + 7 * 24 * 3600_000 // +7 days
  }
};

export function getGame(id: string): Game | undefined {
  return store[id];
}

export function upsertGame(id: string, data: Partial<Game>): Game {
  const existing: Game = store[id] ?? {
    id,
    opensAt: Date.now(),
    closesAt: Date.now()
  };
  const updated: Game = { ...existing, ...data };
  store[id] = updated;
  return updated;
}

export function computeState(g: Game) {
  const now = Date.now();
  const isOpen = now >= g.opensAt && now < g.closesAt;
  const nextTransition = isOpen ? g.closesAt : g.opensAt;
  const timeLeftMs = Math.max(0, nextTransition - now);
  return { isOpen, timeLeftMs };
}