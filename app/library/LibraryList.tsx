"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  getFavorites,
  getFavoritesServerSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";

type SearchEntry = {
  id: string;
  name: string;
  team: string;
  teams: string[];
  position: string;
  years: string;
  hofYear?: number;
};

export function LibraryList() {
  const favIds = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    getFavoritesServerSnapshot,
  );
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    if (favIds.length === 0) return;
    if (index !== null) return;
    let cancelled = false;
    fetch("/players.json")
      .then((r) => r.json() as Promise<SearchEntry[]>)
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [favIds.length, index]);

  const entries = useMemo(() => {
    if (!index) return null;
    const set = new Set(favIds);
    const byId = new Map(index.filter((e) => set.has(e.id)).map((e) => [e.id, e]));
    return favIds
      .slice()
      .reverse()
      .map((id) => byId.get(id))
      .filter((e): e is SearchEntry => Boolean(e));
  }, [index, favIds]);

  if (favIds.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You haven&apos;t favorited any players yet.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Search for a player, open their card, and tap{" "}
          <span className="font-medium">♡ Favorite</span> to save them here.
        </p>
        <Link
          href="/"
          className="self-center rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Go search &rarr;
        </Link>
      </div>
    );
  }
  if (fetchFailed) {
    return <p className="text-sm text-rose-600">Couldn&apos;t load player data.</p>;
  }
  if (!entries) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading library…</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
      {entries.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
          <Link
            href={`/card/${p.id}`}
            className="flex min-w-0 flex-1 items-baseline justify-between gap-3 hover:underline"
          >
            <span className="flex items-baseline gap-2">
              <span className="font-medium">{p.name}</span>
              {p.hofYear !== undefined && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                  HoF {p.hofYear}
                </span>
              )}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {[p.team, p.position, p.years].filter(Boolean).join(" · ")}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => toggleFavorite(p.id)}
            aria-label={`Remove ${p.name} from favorites`}
            className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            ♥
          </button>
        </li>
      ))}
    </ul>
  );
}
