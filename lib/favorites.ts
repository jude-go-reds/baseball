// Browser-local favorites for both players and teams. Backed by
// localStorage, exposed through useSyncExternalStore-friendly getters.
// Two independent stores share the same factory so the API stays uniform.
//
// When the user is signed in, FavoritesSyncProvider installs a remote
// writer via setRemoteSync; the store still keeps localStorage in sync
// (so reads are instant) but every toggle also fires the remote writer.

const EMPTY: string[] = [];

type RemoteWriter = (ids: string[]) => void;

type Store = {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => string[];
  getServerSnapshot: () => string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  /** Replace the entire set (used to hydrate from the server). */
  setAll: (ids: string[]) => void;
  /** Empty the set (used on sign-out). */
  clear: () => void;
  /** Install / remove the remote-write hook. Called by the auth provider. */
  setRemoteSync: (writer: RemoteWriter | null) => void;
};

function createStore(key: string): Store {
  let cached: string[] = [];
  let cachedRaw = "\x00";
  let remoteSync: RemoteWriter | null = null;

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

  function writeLocal(ids: string[], raw: string) {
    if (typeof window !== "undefined") {
      try {
        if (ids.length === 0) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, raw);
      } catch {
        // quota / private mode — silently no-op
      }
    }
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
    cached = current;
    cachedRaw = raw;
    writeLocal(current, raw);
    notify();
    if (remoteSync) remoteSync(current);
    return nowFav;
  }

  function setAll(ids: string[]) {
    const next = ids.filter((x) => typeof x === "string");
    const raw = JSON.stringify(next);
    cached = next;
    cachedRaw = raw;
    writeLocal(next, raw);
    notify();
    // Don't call remoteSync — setAll is the path the *remote* writes back.
  }

  function clear() {
    cached = [];
    cachedRaw = "[]";
    writeLocal([], "[]");
    notify();
  }

  function setRemoteSync(writer: RemoteWriter | null) {
    remoteSync = writer;
  }

  return {
    subscribe,
    getSnapshot: readNow,
    getServerSnapshot: () => EMPTY,
    has,
    toggle,
    setAll,
    clear,
    setRemoteSync,
  };
}

const players = createStore("baseball-cards.favorites");
const teams = createStore("baseball-cards.favoriteTeams");

// Players (existing API kept for backwards compat with all consumers).
export const subscribeFavorites = players.subscribe;
export const getFavorites = players.getSnapshot;
export const getFavoritesServerSnapshot = players.getServerSnapshot;
export const isFavorite = players.has;
export const toggleFavorite = players.toggle;
export const setAllFavorites = players.setAll;
export const clearFavorites = players.clear;
export const setRemoteFavoritesSync = players.setRemoteSync;

// Teams.
export const subscribeFavoriteTeams = teams.subscribe;
export const getFavoriteTeams = teams.getSnapshot;
export const getFavoriteTeamsServerSnapshot = teams.getServerSnapshot;
export const isFavoriteTeam = teams.has;
export const toggleFavoriteTeam = teams.toggle;
export const setAllFavoriteTeams = teams.setAll;
export const clearFavoriteTeams = teams.clear;
export const setRemoteFavoriteTeamsSync = teams.setRemoteSync;
