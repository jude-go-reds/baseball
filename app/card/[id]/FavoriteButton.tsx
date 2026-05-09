"use client";

import { useSyncExternalStore } from "react";
import {
  getFavorites,
  getFavoritesServerSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import type { Style } from "@/lib/cards/templates/registry";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

export function FavoriteButton({ id, style }: { id: string; style: Style }) {
  const favs = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    getFavoritesServerSnapshot,
  );
  // Defer the visual state until after hydration so we never show the
  // wrong heart for a frame to users who already favorited this player.
  const mounted = useIsMounted();
  const fav = mounted && favs.includes(id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id, style)}
      aria-pressed={fav}
      style={mounted ? undefined : { visibility: "hidden" }}
      className={`rounded-md border px-4 py-2 text-sm transition ${
        fav
          ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
      }`}
    >
      {fav ? "♥ Favorited" : "♡ Favorite"}
    </button>
  );
}
