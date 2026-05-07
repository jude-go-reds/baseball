import { writeFile } from "node:fs/promises";
import { join } from "node:path";

type ApiTeam = { id: number; name: string; abbreviation?: string };
type ApiPlayer = {
  id: number;
  fullName: string;
  active?: boolean;
  primaryPosition?: { abbreviation?: string };
  currentTeam?: { id?: number };
  mlbDebutDate?: string;
  lastPlayedDate?: string;
};

export type SearchEntry = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
};

const SEASON = new Date().getUTCFullYear();
const BASE = "https://statsapi.mlb.com/api/v1";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "BaseballCardsApp/0.1 (build-index)" },
  });
  if (!res.ok) throw new Error(`MLB API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

async function buildTeamMap(): Promise<Map<number, string>> {
  const json = await fetchJson<{ teams: ApiTeam[] }>(`/teams?sportId=1&activeStatus=Both`);
  const map = new Map<number, string>();
  for (const t of json.teams) {
    map.set(t.id, t.abbreviation ?? t.name);
  }
  return map;
}

function yearsLabel(p: ApiPlayer): string {
  const start = p.mlbDebutDate?.slice(0, 4) ?? "";
  const end = p.lastPlayedDate?.slice(0, 4) ?? "";
  if (p.active && start) return `${start} - present`;
  if (start && end && start !== end) return `${start} - ${end}`;
  return start;
}

async function main() {
  console.log(`Fetching active rosters for ${SEASON}...`);
  const teams = await buildTeamMap();
  const json = await fetchJson<{ people: ApiPlayer[] }>(
    `/sports/1/players?season=${SEASON}`,
  );

  const entries: SearchEntry[] = json.people.map((p) => ({
    id: String(p.id),
    name: p.fullName,
    team: p.currentTeam?.id ? teams.get(p.currentTeam.id) ?? "" : "",
    position: p.primaryPosition?.abbreviation ?? "",
    years: yearsLabel(p),
  }));

  // Sort by name for deterministic diffs.
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const out = join(process.cwd(), "public", "players.json");
  await writeFile(out, JSON.stringify(entries));
  console.log(`Wrote ${entries.length} players to ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
