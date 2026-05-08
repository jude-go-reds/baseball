"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import {
  getFavorites,
  getFavoritesServerSnapshot,
  getFavoriteTeams,
  getFavoriteTeamsServerSnapshot,
  subscribeFavorites,
  subscribeFavoriteTeams,
  toggleFavorite,
  toggleFavoriteTeam,
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
  const favTeams = useSyncExternalStore(
    subscribeFavoriteTeams,
    getFavoriteTeams,
    getFavoriteTeamsServerSnapshot,
  );

  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  // Defer the first paint until localStorage has been read on the client,
  // so SSR/first-render don't briefly show the empty-state to users who
  // do have favorites.
  const mounted = useIsMounted();

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

  const playerEntries = useMemo(() => {
    if (!index) return null;
    const set = new Set(favIds);
    const byId = new Map(index.filter((e) => set.has(e.id)).map((e) => [e.id, e]));
    return favIds
      .slice()
      .reverse()
      .map((id) => byId.get(id))
      .filter((e): e is SearchEntry => Boolean(e));
  }, [index, favIds]);

  if (!mounted) {
    return <Skeleton />;
  }

  if (favIds.length === 0 && favTeams.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You haven&apos;t favorited anything yet.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Favorite a player from their card page, or a team from{" "}
          <Link href="/browse" className="underline">
            Browse
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Teams{" "}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({favTeams.length})
          </span>
        </h2>
        {favTeams.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No favorite teams yet.{" "}
            <Link href="/browse" className="underline">
              Browse
            </Link>{" "}
            and tap{" "}
            <span className="font-medium">♡ Favorite team</span> on a team page.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {favTeams
              .slice()
              .reverse()
              .map((t) => (
                <li key={t} className="flex items-center gap-1">
                  <Link
                    href={`/browse/team/${t}`}
                    className="rounded-l-md border border-r-0 border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
                  >
                    {t}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavoriteTeam(t)}
                    aria-label={`Remove ${t} from favorite teams`}
                    className="rounded-r-md border border-gray-300 px-2 py-1.5 text-rose-600 hover:bg-rose-50 dark:border-gray-700 dark:text-rose-300 dark:hover:bg-rose-950"
                  >
                    ♥
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Players{" "}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({favIds.length})
          </span>
        </h2>
        {favIds.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No favorite players yet.</p>
        ) : fetchFailed ? (
          <p className="text-sm text-rose-600">Couldn&apos;t load player data.</p>
        ) : !playerEntries ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {playerEntries.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
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
        )}
      </section>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <section className="flex flex-col gap-3">
        <div className="h-6 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-8 w-20 rounded-md bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="h-6 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-md bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
