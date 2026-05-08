import { readFile, writeFile } from "node:fs/promises";
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
  /** Most recent team — primary display label. */
  team: string;
  /** Every team the player played for, in chronological order. */
  teams: string[];
  position: string;
  years: string;
  /** Hall of Fame induction year, present iff the player is in the HoF. */
  hofYear?: number;
  /** Career stats merged from data/historical/players.json. */
  warBat?: number;
  warPit?: number;
  opsPlus?: number;
  eraPlus?: number;
};

type HistoricalEntry = {
  warBat: number | null;
  warPit: number | null;
  opsPlus: number | null;
  eraPlus: number | null;
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

function shortLabel(raw: string): string {
  if (raw.length <= 6) return raw;
  // Initialism for long historical / Negro League team names.
  return raw.split(" ").map((w) => w[0] ?? "").join("").slice(0, 4) || raw.slice(0, 4);
}

async function buildTeamMap(): Promise<Map<number, string>> {
  const json = await fetchJson<{ teams: ApiTeam[] }>(`/teams?sportId=1&activeStatus=Both`);
  const map = new Map<number, string>();
  for (const t of json.teams) {
    map.set(t.id, t.abbreviation ?? shortLabel(t.name));
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

  // Merge per player across seasons: keep the entry with the latest
  // lastPlayedDate as the canonical metadata, but accumulate every team
  // the player appeared for so the team filter can match prior teams
  // (e.g. Greg Maddux on the Cubs years before his Braves run).
  const byId = new Map<number, { player: ApiPlayer; teamIds: number[] }>();
  for (const list of all) {
    for (const p of list) {
      let agg = byId.get(p.id);
      if (!agg) {
        agg = { player: p, teamIds: [] };
        byId.set(p.id, agg);
      } else {
        const a = p.lastPlayedDate ?? "";
        const b = agg.player.lastPlayedDate ?? "";
        if (a > b) agg.player = p;
      }
      const tid = p.currentTeam?.id;
      if (tid && !agg.teamIds.includes(tid)) agg.teamIds.push(tid);
    }
  }

  // Merge in historical career stats (WAR / OPS+ / ERA+) so the client
  // search index can filter by them.
  let historical: Record<string, HistoricalEntry> = {};
  try {
    const path = join(process.cwd(), "data", "historical", "players.json");
    historical = JSON.parse(await readFile(path, "utf8")) as Record<
      string,
      HistoricalEntry
    >;
    console.log(`Loaded historical stats for ${Object.keys(historical).length} players`);
  } catch (err) {
    console.warn(
      `  ! historical stats not loaded: ${(err as Error).message} (continuing without)`,
    );
  }

  const entries: SearchEntry[] = Array.from(byId.values()).map(({ player: p, teamIds }) => {
    const teamList = teamIds
      .map((id) => teams.get(id) ?? "")
      .filter((t) => t.length > 0);
    const primary = teamList[teamList.length - 1] || teamLabel(p, teams);
    const entry: SearchEntry = {
      id: String(p.id),
      name: p.fullName,
      team: primary,
      teams: teamList,
      position: p.primaryPosition?.abbreviation ?? "",
      years: yearsLabel(p),
    };
    const hofYear = hof.get(p.id);
    if (hofYear !== undefined) entry.hofYear = hofYear;
    const h = historical[String(p.id)];
    if (h) {
      if (h.warBat !== null) entry.warBat = h.warBat;
      if (h.warPit !== null) entry.warPit = h.warPit;
      if (h.opsPlus !== null) entry.opsPlus = h.opsPlus;
      if (h.eraPlus !== null) entry.eraPlus = h.eraPlus;
    }
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
