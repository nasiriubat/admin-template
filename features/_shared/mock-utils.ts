/** Deterministic helpers for building stable, realistic demo data (no Math.random in seeds). */
export function createRng(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    chance: (p: number) => next() < p,
  };
}

export const FIRST_NAMES = ['Avery', 'Jordan', 'Sam', 'Riley', 'Morgan', 'Taylor', 'Casey', 'Quinn', 'Harper', 'Rowan', 'Sasha', 'Noor', 'Mika', 'Lena', 'Omar', 'Priya', 'Mateo', 'Yuki', 'Amara', 'Elif', 'Tomas', 'Ines', 'Kofi', 'Ravi'] as const;
export const LAST_NAMES = ['Morgan', 'Lee', 'Rivera', 'Nguyen', 'Okafor', 'Silva', 'Haddad', 'Kowalski', 'Tanaka', 'Fischer', 'Bianchi', 'Mensah', 'Larsen', 'Costa', 'Singh', 'Moreau', 'Novak', 'Reyes'] as const;

/** Fixed reference "now" so seeded timestamps are stable across reloads: relative to real now. */
export const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
export const daysAgo = (d: number) => minutesAgo(d * 24 * 60);

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
