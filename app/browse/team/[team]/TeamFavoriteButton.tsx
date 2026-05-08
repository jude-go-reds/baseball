"use client";

import { useSyncExternalStore } from "react";
import {
  getFavoriteTeams,
  getFavoriteTeamsServerSnapshot,
  subscribeFavoriteTeams,
  toggleFavoriteTeam,
} from "@/lib/favorites";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

export function TeamFavoriteButton({ team }: { team: string }) {
  const favs = useSyncExternalStore(
    subscribeFavoriteTeams,
    getFavoriteTeams,
    getFavoriteTeamsServerSnapshot,
  );
  const mounted = useIsMounted();
  const fav = mounted && favs.includes(team);

  return (
    <button
      type="button"
      onClick={() => toggleFavoriteTeam(team)}
      aria-pressed={fav}
      style={mounted ? undefined : { visibility: "hidden" }}
      className={`self-start rounded-md border px-3 py-1.5 text-xs transition ${
        fav
          ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
      }`}
    >
      {fav ? "♥ Favorited" : "♡ Favorite team"}
    </button>
  );
}
