"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import {
  clearFavoriteTeams,
  clearFavorites,
  getFavoriteTeams,
  getFavorites,
  setAllFavoriteTeams,
  setAllFavorites,
  setRemoteFavoriteTeamsSync,
  setRemoteFavoritesSync,
} from "@/lib/favorites";

const SYNC_DEBOUNCE_MS = 400;

type RemoteFavorites = { players: string[]; teams: string[] };

function debounced<T>(fn: (arg: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArg: T;
  return (arg: T) => {
    lastArg = arg;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(lastArg);
    }, ms);
  };
}

async function pullRemote(): Promise<RemoteFavorites> {
  const res = await fetch("/api/favorites", { cache: "no-store" });
  if (!res.ok) return { players: [], teams: [] };
  const data = (await res.json()) as Partial<RemoteFavorites>;
  return {
    players: Array.isArray(data.players) ? data.players : [],
    teams: Array.isArray(data.teams) ? data.teams : [],
  };
}

async function pushRemote(payload: RemoteFavorites): Promise<void> {
  await fetch("/api/favorites", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function uniq(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const x of list) {
      if (!seen.has(x)) {
        seen.add(x);
        out.push(x);
      }
    }
  }
  return out;
}

export function FavoritesSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  // Track whether the previous render had us signed in, so we only clear
  // on the *transition* signed-in -> signed-out (not on first load when
  // we've never been signed in to begin with).
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setRemoteFavoritesSync(null);
      setRemoteFavoriteTeamsSync(null);
      if (wasSignedIn.current) {
        clearFavorites();
        clearFavoriteTeams();
      }
      wasSignedIn.current = false;
      return;
    }

    let cancelled = false;
    (async () => {
      const remote = await pullRemote();
      if (cancelled) return;

      const localPlayers = getFavorites();
      const localTeams = getFavoriteTeams();
      const mergedPlayers = uniq(remote.players, localPlayers);
      const mergedTeams = uniq(remote.teams, localTeams);

      setAllFavorites(mergedPlayers);
      setAllFavoriteTeams(mergedTeams);

      // Push the merged set so the server has the same view.
      const initialMergeChangedRemote =
        mergedPlayers.length !== remote.players.length ||
        mergedTeams.length !== remote.teams.length;
      if (initialMergeChangedRemote) {
        void pushRemote({ players: mergedPlayers, teams: mergedTeams });
      }

      const writePlayers = debounced((ids: string[]) => {
        void pushRemote({ players: ids, teams: getFavoriteTeams() });
      }, SYNC_DEBOUNCE_MS);
      const writeTeams = debounced((ids: string[]) => {
        void pushRemote({ players: getFavorites(), teams: ids });
      }, SYNC_DEBOUNCE_MS);

      setRemoteFavoritesSync(writePlayers);
      setRemoteFavoriteTeamsSync(writeTeams);
      wasSignedIn.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return <>{children}</>;
}
