"use client";

import { useEffect, useMemo, useState } from "react";

export type PlayerIndexEntry = {
  id: string;
  name: string;
  team: string;
  teams: string[];
  position: string;
  years: string;
  hofYear?: number;
  warBat?: number;
  warPit?: number;
  opsPlus?: number;
  eraPlus?: number;
  mvp?: number;
  cyYoung?: number;
  roy?: number;
  wsChamp?: number;
  wsMvp?: number;
  allStar?: number;
  goldGlove?: number;
  silverSlugger?: number;
};

// Module-level cache so multiple components share the same fetch.
let cached: PlayerIndexEntry[] | null = null;
let inFlight: Promise<PlayerIndexEntry[]> | null = null;

async function fetchIndex(): Promise<PlayerIndexEntry[]> {
  if (cached) return cached;
  if (inFlight) return inFlight;
  inFlight = fetch("/players.json")
    .then((r) => r.json() as Promise<PlayerIndexEntry[]>)
    .then((data) => {
      cached = data;
      inFlight = null;
      return data;
    })
    .catch((err) => {
      inFlight = null;
      throw err;
    });
  return inFlight;
}

export function usePlayerIndex(enabled = true): {
  byId: Map<string, PlayerIndexEntry> | null;
  failed: boolean;
} {
  const [data, setData] = useState<PlayerIndexEntry[] | null>(cached);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (data) return;
    let cancelled = false;
    fetchIndex()
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, data]);

  const byId = useMemo(() => {
    if (!data) return null;
    return new Map(data.map((e) => [e.id, e]));
  }, [data]);

  return { byId, failed };
}
