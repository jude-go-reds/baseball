// Pulls career hitting stats (AVG and a handful of counting stats) for
// every player from the MLB Stats API bulk endpoint and merges them into
// public/players.json. The career endpoint is paginated at 1000 per page,
// so this is a small handful of calls — minutes, not the half-hour a
// per-player loop would take.
//
// Run with: `npm run build:batting`

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://statsapi.mlb.com/api/v1";
const PAGE_SIZE = 1000;

type Career = {
  avg?: string;
  hits?: number;
  homeRuns?: number;
  rbi?: number;
  runs?: number;
  stolenBases?: number;
  atBats?: number;
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
    `${BASE}/stats?stats=career&group=hitting&playerPool=all` +
    `&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "BaseballCardsApp/0.1 (build-batting)" },
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
      // Skip 0-AB lines: AVG = .000 with 0 AB looks bad in the index.
      const ab = numField(stat.atBats);
      if (ab !== undefined && ab === 0) continue;
      const career: Career = {};
      const avg = stat.avg;
      if (typeof avg === "string" && avg.length > 0) career.avg = avg;
      const hits = numField(stat.hits);
      if (hits !== undefined) career.hits = hits;
      const hr = numField(stat.homeRuns);
      if (hr !== undefined) career.homeRuns = hr;
      const rbi = numField(stat.rbi);
      if (rbi !== undefined) career.rbi = rbi;
      const runs = numField(stat.runs);
      if (runs !== undefined) career.runs = runs;
      const sb = numField(stat.stolenBases);
      if (sb !== undefined) career.stolenBases = sb;
      if (ab !== undefined) career.atBats = ab;
      out.set(String(id), career);
    }
    console.log(`  ${offset}+${splits.length} = ${out.size} players`);
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
  console.log("Fetching career hitting stats from MLB Stats API…");
  const careers = await fetchAll();

  const indexPath = join(process.cwd(), "public", "players.json");
  const raw = await readFile(indexPath, "utf8");
  const entries = JSON.parse(raw) as Array<Record<string, unknown>>;

  const fields = ["avg", "hits", "homeRuns", "rbi", "runs", "stolenBases", "atBats"];
  let updated = 0;
  for (const e of entries) {
    const id = e.id as string;
    for (const f of fields) delete e[f];
    const c = careers.get(id);
    if (!c) continue;
    if (c.avg !== undefined) e.avg = c.avg;
    if (c.hits !== undefined) e.hits = c.hits;
    if (c.homeRuns !== undefined) e.homeRuns = c.homeRuns;
    if (c.rbi !== undefined) e.rbi = c.rbi;
    if (c.runs !== undefined) e.runs = c.runs;
    if (c.stolenBases !== undefined) e.stolenBases = c.stolenBases;
    if (c.atBats !== undefined) e.atBats = c.atBats;
    updated++;
  }
  await writeFile(indexPath, JSON.stringify(entries));
  console.log(`Wrote career hitting onto ${updated} of ${entries.length} entries`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
