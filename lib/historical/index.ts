// Loaded once at module init. The JSON is bundled into the serverless
// function during `next build`, so this read happens at deploy time, not
// per-request. Refreshed by running `npm run build:historical` and
// committing the file.

import data from "@/data/historical/players.json";

export type HistoricalEntry = {
  warBat: number | null;
  warPit: number | null;
  opsPlus: number | null;
  eraPlus: number | null;
};

const map = data as Record<string, HistoricalEntry>;

export function getHistorical(id: string): HistoricalEntry | null {
  return map[id] ?? null;
}
