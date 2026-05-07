import { writeFile } from "node:fs/promises";
import { join } from "node:path";

type ApiTeam = { id: number; name: string; abbreviation?: string };
type ApiPlayer = {
  id: number;
  fullName: string;
  active?: boolean;
  primaryPosition?: { abbreviation?: string };
  currentTeam?: { id?: number; name?: string };
  mlbDebutDate?: string;
  lastPlayedDate?: string;
};

export type SearchEntry = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
  /** Hall of Fame induction year, present iff the player is in the HoF. */
  hofYear?: number;
};

type ApiAward = { season?: string; player?: { id?: number } };

const FIRST_MLB_SEASON = 1876;
const CURRENT_SEASON = new Date().getUTCFullYear();
const CONCURRENCY = 6;
const BASE = "https://statsapi.mlb.com/api/v1";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "BaseballCardsApp/0.1 (build-index)" },
  });
  if (!res.ok) throw new Error(`MLB API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

async function buildHofMap(): Promise<Map<number, number>> {
  const json = await fetchJson<{ awards: ApiAward[] }>(
    `/awards/MLBHOF/recipients`,
  );
  const map = new Map<number, number>();
  for (const a of json.awards ?? []) {
    const id = a.player?.id;
    const year = a.season ? Number(a.season) : NaN;
    if (id && Number.isFinite(year)) map.set(id, year);
  }
  return map;
}

async function buildTeamMap(): Promise<Map<number, string>> {
  const json = await fetchJson<{ teams: ApiTeam[] }>(`/teams?sportId=1&activeStatus=Both`);
  const map = new Map<number, string>();
  for (const t of json.teams) map.set(t.id, t.abbreviation ?? t.name);
  return map;
}

function yearsLabel(p: ApiPlayer): string {
  const start = p.mlbDebutDate?.slice(0, 4) ?? "";
  const end = p.lastPlayedDate?.slice(0, 4) ?? "";
  if (p.active && start) return `${start} - present`;
  if (start && end && start !== end) return `${start} - ${end}`;
  return start;
}

function teamLabel(p: ApiPlayer, teams: Map<number, string>): string {
  const id = p.currentTeam?.id;
  if (id && teams.has(id)) return teams.get(id) as string;
  const name = p.currentTeam?.name ?? "";
  // Trim long Negro League / historical team names; abbreviation in the API
  // is sometimes missing, so fall back to a 6-char truncation.
  if (name.length > 6) return name.split(" ").map((w) => w[0]).join("").slice(0, 4);
  return name;
}

async function fetchSeason(season: number): Promise<ApiPlayer[]> {
  try {
    const json = await fetchJson<{ people?: ApiPlayer[] }>(
      `/sports/1/players?season=${season}`,
    );
    return json.people ?? [];
  } catch (err) {
    console.warn(`  ! ${season}: ${(err as Error).message}`);
    return [];
  }
}

async function pool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await worker(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const seasons: number[] = [];
  for (let y = FIRST_MLB_SEASON; y <= CURRENT_SEASON; y++) seasons.push(y);

  console.log(
    `Fetching MLB rosters for ${seasons.length} seasons (${FIRST_MLB_SEASON} - ${CURRENT_SEASON})...`,
  );
  console.log("Fetching Hall of Fame recipients...");
  const hof = await buildHofMap();
  console.log(`  ${hof.size} HoF inductees`);

  const teams = await buildTeamMap();

  let done = 0;
  const all = await pool(
    seasons,
    async (season) => {
      const result = await fetchSeason(season);
      done++;
      if (done % 25 === 0 || done === seasons.length) {
        console.log(`  ${done}/${seasons.length} seasons fetched`);
      }
      return result;
    },
    CONCURRENCY,
  );

  // Merge & dedupe. When a player appears in multiple seasons, prefer the
  // entry with the most useful metadata (latest last_played wins, then most
  // recent currentTeam).
  const byId = new Map<number, ApiPlayer>();
  for (const list of all) {
    for (const p of list) {
      const existing = byId.get(p.id);
      if (!existing) {
        byId.set(p.id, p);
        continue;
      }
      const a = p.lastPlayedDate ?? "";
      const b = existing.lastPlayedDate ?? "";
      if (a > b) byId.set(p.id, p);
    }
  }

  const entries: SearchEntry[] = Array.from(byId.values()).map((p) => {
    const entry: SearchEntry = {
      id: String(p.id),
      name: p.fullName,
      team: teamLabel(p, teams),
      position: p.primaryPosition?.abbreviation ?? "",
      years: yearsLabel(p),
    };
    const hofYear = hof.get(p.id);
    if (hofYear !== undefined) entry.hofYear = hofYear;
    return entry;
  });

  entries.sort((a, b) => a.name.localeCompare(b.name));

  const out = join(process.cwd(), "public", "players.json");
  await writeFile(out, JSON.stringify(entries));
  console.log(`Wrote ${entries.length} players to ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
