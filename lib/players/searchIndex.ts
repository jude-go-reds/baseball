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

function debutDecade(years: string): number | null {
  const match = years.match(/^(\d{4})/);
  if (!match) return null;
  const y = Number(match[1]);
  return Math.floor(y / 10) * 10;
}

export function getByEra(decade: number): SearchEntry[] {
  return all
    .filter((e) => debutDecade(e.years) === decade)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getEras(): Array<{ decade: number; count: number }> {
  const counts = new Map<number, number>();
  for (const e of all) {
    const d = debutDecade(e.years);
    if (d === null) continue;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return Array.from(counts, ([decade, count]) => ({ decade, count })).sort(
    (a, b) => b.decade - a.decade,
  );
}
