"use client";

import { useSyncExternalStore } from "react";
import {
  getFavorites,
  getFavoritesServerSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";

export function FavoriteButton({ id }: { id: string }) {
  const favs = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    getFavoritesServerSnapshot,
  );
  const fav = favs.includes(id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-pressed={fav}
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
