// Aggregate per-player career counts for the major MLB awards by hitting
// /awards/<id>/recipients for each one and bucketing by player id. Writes
// public/players.json in place, only touching the award-count fields.
//
// Run with: `npx tsx scripts/build-awards-counts.ts`

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://statsapi.mlb.com/api/v1";

type ApiAward = { season?: string; player?: { id?: number } };

// award field on SearchEntry  ←  list of MLB award IDs to sum into it
const AWARD_GROUPS: Record<string, string[]> = {
  mvp: ["ALMVP", "NLMVP"],
  cyYoung: ["ALCY", "NLCY"],
  roy: ["ALROY", "NLROY"],
  wsChamp: ["WSCHAMP"],
  wsMvp: ["WSMVP"],
  allStar: ["ALAS", "NLAS"],
  goldGlove: ["ALGG", "NLGG"],
  silverSlugger: ["ALSS", "NLSS"],
};

type AwardCounts = Partial<Record<keyof typeof AWARD_GROUPS, number>>;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "BaseballCardsApp/0.1 (build-awards)" },
  });
  if (!res.ok) throw new Error(`MLB API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

async function fetchAward(id: string): Promise<ApiAward[]> {
  try {
    const json = await fetchJson<{ awards?: ApiAward[] }>(
      `/awards/${id}/recipients`,
    );
    return json.awards ?? [];
  } catch (err) {
    console.warn(`  ! ${id}: ${(err as Error).message}`);
    return [];
  }
}

export async function buildAwardCounts(): Promise<Map<string, AwardCounts>> {
  const counts = new Map<string, AwardCounts>();
  for (const [field, ids] of Object.entries(AWARD_GROUPS)) {
    const key = field as keyof typeof AWARD_GROUPS;
    let total = 0;
    for (const id of ids) {
      const recipients = await fetchAward(id);
      for (const a of recipients) {
        const pid = a.player?.id;
        if (!pid) continue;
        const k = String(pid);
        const cur = counts.get(k) ?? {};
        cur[key] = (cur[key] ?? 0) + 1;
        counts.set(k, cur);
        total++;
      }
    }
    console.log(`  ${field}: ${total} winner-seasons`);
  }
  return counts;
}

async function main() {
  console.log("Fetching award recipients from MLB Stats API…");
  const counts = await buildAwardCounts();
  console.log(`Built award counts for ${counts.size} players`);

  const indexPath = join(process.cwd(), "public", "players.json");
  const raw = await readFile(indexPath, "utf8");
  const entries = JSON.parse(raw) as Array<Record<string, unknown>>;

  const fields = Object.keys(AWARD_GROUPS);
  let updated = 0;
  for (const e of entries) {
    const id = e.id as string;
    // Strip any prior award fields so removed awards don't linger.
    for (const f of fields) delete e[f];
    const c = counts.get(id);
    if (!c) continue;
    for (const [k, v] of Object.entries(c)) {
      if (typeof v === "number" && v > 0) e[k] = v;
    }
    updated++;
  }
  await writeFile(indexPath, JSON.stringify(entries));
  console.log(`Wrote awards onto ${updated} of ${entries.length} entries`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
