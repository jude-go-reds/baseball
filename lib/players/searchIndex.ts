// Server-side accessor for the search index. Same JSON the client fetches
// from /players.json — bundled into the server function via the import so
// browse pages don't need an extra HTTP hop.

import indexData from "@/public/players.json";

export type SearchEntry = {
  id: string;
  name: string;
  team: string;
  teams: string[];
  position: string;
  years: string;
  hofYear?: number;
};

const all = indexData as SearchEntry[];

export function getAll(): SearchEntry[] {
  return all;
}

export function getHallOfFamers(): SearchEntry[] {
  return all
    .filter((e) => e.hofYear !== undefined)
    .sort((a, b) => (b.hofYear ?? 0) - (a.hofYear ?? 0));
}

export function getByTeam(team: string): SearchEntry[] {
  const t = team.toUpperCase();
  return all
    .filter((e) => e.teams.some((x) => x.toUpperCase() === t))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTeams(): Array<{ team: string; count: number }> {
  const counts = new Map<string, number>();
  for (const e of all) {
    for (const t of e.teams) {
      if (!t) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([team, count]) => ({ team, count })).sort(
    (a, b) => b.count - a.count,
  );
}

/** Every decade the player appeared in MLB, inclusive of debut & final year. */
function playedDecades(years: string): number[] {
  const m = years.match(/^(\d{4})(?:\s*-\s*(\d{4}|present))?/);
  if (!m) return [];
  const start = Number(m[1]);
  const endRaw = m[2];
  const end = !endRaw
    ? start
    : endRaw === "present"
      ? new Date().getUTCFullYear()
      : Number(endRaw);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const startDecade = Math.floor(start / 10) * 10;
  const endDecade = Math.floor(end / 10) * 10;
  const out: number[] = [];
  for (let d = startDecade; d <= endDecade; d += 10) out.push(d);
  return out;
}

export function getByEra(decade: number): SearchEntry[] {
  return all
    .filter((e) => playedDecades(e.years).includes(decade))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getEras(): Array<{ decade: number; count: number }> {
  const counts = new Map<number, number>();
  for (const e of all) {
    for (const d of playedDecades(e.years)) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([decade, count]) => ({ decade, count })).sort(
    (a, b) => b.decade - a.decade,
  );
}
