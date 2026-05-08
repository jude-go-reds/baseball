// Pulls career pitching stats (W, L, SV, K, ERA, IP, WHIP, GS) for every
// pitcher from the MLB Stats API bulk career endpoint and merges them
// into public/players.json. Same pagination pattern as build-batting.ts.
//
// Run with: `npm run build:pitching`

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://statsapi.mlb.com/api/v1";
const PAGE_SIZE = 1000;

type Career = {
  wins?: number;
  losses?: number;
  saves?: number;
  strikeOuts?: number;
  era?: string;
  whip?: string;
  inningsPitched?: string;
  gamesStarted?: number;
};

type ApiSplit = {
  player?: { id?: number };
  stat?: Record<string, unknown>;
};

type ApiStats = {
  stats?: Array<{ totalSplits?: number; splits?: ApiSplit[] }>;
};

async function fetchPage(offset: number): Promise<ApiSplit[]> {
  const url =
    `${BASE}/stats?stats=career&group=pitching&playerPool=all` +
    `&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "BaseballCardsApp/0.1 (build-pitching)" },
  });
  if (!res.ok) throw new Error(`MLB API ${res.status} for offset=${offset}`);
  const data = (await res.json()) as ApiStats;
  return data.stats?.[0]?.splits ?? [];
}

async function fetchAll(): Promise<Map<string, Career>> {
  const out = new Map<string, Career>();
  let offset = 0;
  while (true) {
    const splits = await fetchPage(offset);
    if (splits.length === 0) break;
    for (const s of splits) {
      const id = s.player?.id;
      if (!id) continue;
      const stat = s.stat ?? {};
      // Skip 0-IP rows.
      const ipStr = stat.inningsPitched;
      if (typeof ipStr === "string" && Number(ipStr) === 0) continue;
      const career: Career = {};
      const wins = numField(stat.wins);
      if (wins !== undefined) career.wins = wins;
      const losses = numField(stat.losses);
      if (losses !== undefined) career.losses = losses;
      const saves = numField(stat.saves);
      if (saves !== undefined) career.saves = saves;
      const k = numField(stat.strikeOuts);
      if (k !== undefined) career.strikeOuts = k;
      const gs = numField(stat.gamesStarted);
      if (gs !== undefined) career.gamesStarted = gs;
      if (typeof stat.era === "string") career.era = stat.era;
      if (typeof stat.whip === "string") career.whip = stat.whip;
      if (typeof stat.inningsPitched === "string") {
        career.inningsPitched = stat.inningsPitched;
      }
      out.set(String(id), career);
    }
    console.log(`  ${offset}+${splits.length} = ${out.size} pitchers`);
    if (splits.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return out;
}

function numField(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

async function main() {
  console.log("Fetching career pitching stats from MLB Stats API…");
  const careers = await fetchAll();

  const indexPath = join(process.cwd(), "public", "players.json");
  const raw = await readFile(indexPath, "utf8");
  const entries = JSON.parse(raw) as Array<Record<string, unknown>>;

  const fields = [
    "wins",
    "losses",
    "saves",
    "strikeOuts",
    "era",
    "whip",
    "inningsPitched",
    "gamesStarted",
  ];
  let updated = 0;
  for (const e of entries) {
    const id = e.id as string;
    for (const f of fields) delete e[f];
    const c = careers.get(id);
    if (!c) continue;
    if (c.wins !== undefined) e.wins = c.wins;
    if (c.losses !== undefined) e.losses = c.losses;
    if (c.saves !== undefined) e.saves = c.saves;
    if (c.strikeOuts !== undefined) e.strikeOuts = c.strikeOuts;
    if (c.era !== undefined) e.era = c.era;
    if (c.whip !== undefined) e.whip = c.whip;
    if (c.inningsPitched !== undefined) e.inningsPitched = c.inningsPitched;
    if (c.gamesStarted !== undefined) e.gamesStarted = c.gamesStarted;
    updated++;
  }
  await writeFile(indexPath, JSON.stringify(entries));
  console.log(`Wrote career pitching onto ${updated} of ${entries.length} entries`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
