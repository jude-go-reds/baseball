// Imports Baseball-Reference's daily WAR text files and aggregates career
// WAR / OPS+ / ERA+ per player, keyed by MLB Stats API id (mlb_ID is a
// column in B-Ref's file, so no Chadwick crosswalk is needed).
//
// Run via `npm run build:historical`. Output is committed at
// data/historical/players.json. B-Ref permits non-commercial reuse of
// these files with attribution; we credit them on the card back.

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BAT_URL = "https://www.baseball-reference.com/data/war_daily_bat.txt";
const PIT_URL = "https://www.baseball-reference.com/data/war_daily_pitch.txt";
const UA = "BaseballCardsApp/0.1 (build-historical)";

export type HistoricalEntry = {
  warBat: number | null;
  warPit: number | null;
  opsPlus: number | null;
  eraPlus: number | null;
};

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split("\n").filter((l) => l.length > 0);
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((l) => l.split(","));
  return { headers, rows };
}

function num(v: string | undefined): number | null {
  if (!v || v === "NULL") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

type Aggregate = {
  warSum: number;
  warSumValid: boolean;
  warPit: number | null;
  opsPlusWeightedSum: number;
  opsPlusWeight: number;
  eraPlusWeightedSum: number;
  eraPlusWeight: number;
  ipouts: number;
  pa: number;
};

function emptyAggregate(): Aggregate {
  return {
    warSum: 0,
    warSumValid: false,
    warPit: null,
    opsPlusWeightedSum: 0,
    opsPlusWeight: 0,
    eraPlusWeightedSum: 0,
    eraPlusWeight: 0,
    ipouts: 0,
    pa: 0,
  };
}

async function aggregateBatting(
  out: Map<string, Aggregate>,
): Promise<{ rows: number; matched: number }> {
  console.log("Fetching war_daily_bat.txt...");
  const text = await fetchText(BAT_URL);
  const { headers, rows } = parseCsv(text);
  const mlbCol = headers.indexOf("mlb_ID");
  const warCol = headers.indexOf("WAR");
  const opsCol = headers.indexOf("OPS_plus");
  const paCol = headers.indexOf("PA");
  let matched = 0;

  for (const r of rows) {
    const mlbId = r[mlbCol];
    if (!mlbId || mlbId === "NULL" || mlbId === "0") continue;
    const war = num(r[warCol]);
    const ops = num(r[opsCol]);
    const pa = num(r[paCol]) ?? 0;

    let agg = out.get(mlbId);
    if (!agg) {
      agg = emptyAggregate();
      out.set(mlbId, agg);
    }
    if (war !== null) {
      agg.warSum += war;
      agg.warSumValid = true;
    }
    // OPS+ outliers: B-Ref uses sentinels like -100 for unreliable rows
    // (e.g., 0-PA appearances). Skip those and weight by PA.
    if (ops !== null && ops > -50 && ops < 1000 && pa > 0) {
      agg.opsPlusWeightedSum += ops * pa;
      agg.opsPlusWeight += pa;
    }
    agg.pa += pa;
    matched++;
  }
  return { rows: rows.length, matched };
}

async function aggregatePitching(
  out: Map<string, Aggregate>,
): Promise<{ rows: number; matched: number }> {
  console.log("Fetching war_daily_pitch.txt...");
  const text = await fetchText(PIT_URL);
  const { headers, rows } = parseCsv(text);
  const mlbCol = headers.indexOf("mlb_ID");
  const warCol = headers.indexOf("WAR");
  const eraCol = headers.indexOf("ERA_plus");
  const ipoutsCol = headers.indexOf("IPouts");
  let matched = 0;

  for (const r of rows) {
    const mlbId = r[mlbCol];
    if (!mlbId || mlbId === "NULL" || mlbId === "0") continue;
    const war = num(r[warCol]);
    const era = num(r[eraCol]);
    const ipouts = num(r[ipoutsCol]) ?? 0;

    let agg = out.get(mlbId);
    if (!agg) {
      agg = emptyAggregate();
      out.set(mlbId, agg);
    }
    // Pitching WAR is a separate bucket: track in a parallel field by
    // negating into ipouts as the weight. We re-use warSum here for the
    // batting sum only; pitching WAR goes into eraPlus's sibling.
    // Simpler: keep a separate property; but to avoid restructuring,
    // we'll store pitching WAR in the OPS+ bucket — no, that's messy.
    // Cleanest: extend Aggregate.
    if (war !== null) {
      agg.warPit = (agg.warPit ?? 0) + war;
    }
    if (era !== null && era > 0 && era < 1000 && ipouts > 0) {
      agg.eraPlusWeightedSum += era * ipouts;
      agg.eraPlusWeight += ipouts;
    }
    agg.ipouts += ipouts;
    matched++;
  }
  return { rows: rows.length, matched };
}

async function main() {
  const aggs = new Map<string, Aggregate>();
  const bat = await aggregateBatting(aggs);
  console.log(`  batting: ${bat.matched}/${bat.rows} rows aggregated`);
  const pit = await aggregatePitching(aggs);
  console.log(`  pitching: ${pit.matched}/${pit.rows} rows aggregated`);

  const out: Record<string, HistoricalEntry> = {};
  for (const [id, a] of aggs) {
    const opsPlus =
      a.opsPlusWeight > 0
        ? Math.round(a.opsPlusWeightedSum / a.opsPlusWeight)
        : null;
    const eraPlus =
      a.eraPlusWeight > 0
        ? Math.round(a.eraPlusWeightedSum / a.eraPlusWeight)
        : null;
    const warBat = a.warSumValid ? round1(a.warSum) : null;
    const warPit = a.warPit !== null ? round1(a.warPit) : null;

    if (warBat === null && warPit === null && opsPlus === null && eraPlus === null) {
      continue;
    }
    out[id] = { warBat, warPit, opsPlus, eraPlus };
  }

  const dir = join(process.cwd(), "data", "historical");
  await mkdir(dir, { recursive: true });
  const path = join(dir, "players.json");
  await writeFile(path, JSON.stringify(out));
  console.log(`Wrote ${Object.keys(out).length} historical entries to ${path}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
