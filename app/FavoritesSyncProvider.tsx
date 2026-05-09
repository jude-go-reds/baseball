"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import {
  clearFavoriteTeams,
  clearFavorites,
  getFavoriteStyles,
  getFavoriteTeams,
  getFavorites,
  setAllFavoriteStyles,
  setAllFavoriteTeams,
  setAllFavorites,
  setRemoteFavoriteStylesSync,
  setRemoteFavoriteTeamsSync,
  setRemoteFavoritesSync,
} from "@/lib/favorites";
import type { Style } from "@/lib/cards/templates/registry";
import { clearCollections, refetchCollections } from "@/lib/collections";
import { clearLineups, refetchLineups } from "@/lib/lineups";

const SYNC_DEBOUNCE_MS = 400;

type PlayerStyles = Record<string, Style>;
type RemoteFavorites = {
  players: string[];
  teams: string[];
  playerStyles: PlayerStyles;
};

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
  if (!res.ok) return { players: [], teams: [], playerStyles: {} };
  const data = (await res.json()) as Partial<RemoteFavorites> & {
    playerStyles?: unknown;
  };
  const playerStyles: PlayerStyles =
    data.playerStyles && typeof data.playerStyles === "object" && !Array.isArray(data.playerStyles)
      ? (data.playerStyles as PlayerStyles)
      : {};
  return {
    players: Array.isArray(data.players) ? data.players : [],
    teams: Array.isArray(data.teams) ? data.teams : [],
    playerStyles,
  };
}

async function pushRemote(payload: RemoteFavorites): Promise<void> {
  await fetch("/api/favorites", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function sameStyles(a: PlayerStyles, b: PlayerStyles): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
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
      setRemoteFavoriteStylesSync(null);
      if (wasSignedIn.current) {
        clearFavorites();
        clearFavoriteTeams();
        clearCollections();
        clearLineups();
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
      const localStyles = getFavoriteStyles();
      const mergedPlayers = uniq(remote.players, localPlayers);
      const mergedTeams = uniq(remote.teams, localTeams);
      // Local edits win on style conflicts — they reflect the user's most
      // recent visit to a card page on this device.
      const mergedStyles: PlayerStyles = {
        ...remote.playerStyles,
        ...localStyles,
      };
      // Drop entries for players that were dropped from the favorites set.
      const playerSet = new Set(mergedPlayers);
      for (const id of Object.keys(mergedStyles)) {
        if (!playerSet.has(id)) delete mergedStyles[id];
      }

      setAllFavorites(mergedPlayers);
      setAllFavoriteTeams(mergedTeams);
      setAllFavoriteStyles(mergedStyles);

      // Push the merged set so the server has the same view.
      const stylesChanged = !sameStyles(mergedStyles, remote.playerStyles);
      const initialMergeChangedRemote =
        mergedPlayers.length !== remote.players.length ||
        mergedTeams.length !== remote.teams.length ||
        stylesChanged;
      if (initialMergeChangedRemote) {
        void pushRemote({
          players: mergedPlayers,
          teams: mergedTeams,
          playerStyles: mergedStyles,
        });
      }

      const writePlayers = debounced((ids: string[]) => {
        void pushRemote({
          players: ids,
          teams: getFavoriteTeams(),
          playerStyles: getFavoriteStyles(),
        });
      }, SYNC_DEBOUNCE_MS);
      const writeTeams = debounced((ids: string[]) => {
        void pushRemote({
          players: getFavorites(),
          teams: ids,
          playerStyles: getFavoriteStyles(),
        });
      }, SYNC_DEBOUNCE_MS);
      const writeStyles = debounced((map: PlayerStyles) => {
        void pushRemote({
          players: getFavorites(),
          teams: getFavoriteTeams(),
          playerStyles: map,
        });
      }, SYNC_DEBOUNCE_MS);

      setRemoteFavoritesSync(writePlayers);
      setRemoteFavoriteTeamsSync(writeTeams);
      setRemoteFavoriteStylesSync(writeStyles);

      // Pull collections + lineups — they share the same auth lifecycle.
      void refetchCollections();
      void refetchLineups();

      wasSignedIn.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return <>{children}</>;
}
