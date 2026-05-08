// Browser-local favorites for both players and teams. Backed by
// localStorage, exposed through useSyncExternalStore-friendly getters.
// Two independent stores share the same factory so the API stays uniform.

const EMPTY: string[] = [];

type Store = {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => string[];
  getServerSnapshot: () => string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
};

function createStore(key: string): Store {
  let cached: string[] = [];
  let cachedRaw = "\x00";

  function readNow(): string[] {
    if (typeof window === "undefined") return cached;
    const raw = window.localStorage.getItem(key) ?? "";
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cached = Array.isArray(parsed)
        ? parsed.filter((x) => typeof x === "string")
        : [];
    } catch {
      cached = [];
    }
    return cached;
  }

  const listeners = new Set<() => void>();
  function notify() {
    for (const fn of listeners) fn();
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cb();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      listeners.delete(cb);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }

  function has(id: string): boolean {
    return readNow().includes(id);
  }

  function toggle(id: string): boolean {
    const current = readNow().slice();
    const idx = current.indexOf(id);
    let nowFav: boolean;
    if (idx >= 0) {
      current.splice(idx, 1);
      nowFav = false;
    } else {
      current.push(id);
      nowFav = true;
    }
    const raw = JSON.stringify(current);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        // quota / private mode — silently no-op
      }
    }
    cached = current;
    cachedRaw = raw;
    notify();
    return nowFav;
  }

  return {
    subscribe,
    getSnapshot: readNow,
    getServerSnapshot: () => EMPTY,
    has,
    toggle,
  };
}

const players = createStore("baseball-cards.favorites");
const teams = createStore("baseball-cards.favoriteTeams");

// Players (unchanged API for backwards compat with existing imports).
export const subscribeFavorites = players.subscribe;
export const getFavorites = players.getSnapshot;
export const getFavoritesServerSnapshot = players.getServerSnapshot;
export const isFavorite = players.has;
export const toggleFavorite = players.toggle;

// Teams.
export const subscribeFavoriteTeams = teams.subscribe;
export const getFavoriteTeams = teams.getSnapshot;
export const getFavoriteTeamsServerSnapshot = teams.getServerSnapshot;
export const isFavoriteTeam = teams.has;
export const toggleFavoriteTeam = teams.toggle;
