// Browser-local favorites. No server, no accounts — just localStorage.
// Exposes a stable getSnapshot + subscribe pair so components can use
// useSyncExternalStore to stay in sync (across tabs via 'storage' events
// and within the same tab via the in-memory listener set).

const KEY = "baseball-cards.favorites";

let cached: string[] = [];
let cachedRaw = "\x00"; // sentinel that won't match any real serialization

function readNow(): string[] {
  if (typeof window === "undefined") return cached;
  const raw = window.localStorage.getItem(KEY) ?? "";
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    cached = [];
  }
  return cached;
}

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

/** For useSyncExternalStore — call this in a useEffect-ish pattern. */
export function subscribeFavorites(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
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

/** Stable-reference getter — only returns a new array when the underlying value changes. */
export function getFavorites(): string[] {
  return readNow();
}

/** Server snapshot for useSyncExternalStore — always returns the empty list. */
export function getFavoritesServerSnapshot(): string[] {
  return EMPTY;
}
const EMPTY: string[] = [];

export function isFavorite(id: string): boolean {
  return readNow().includes(id);
}

/** Toggles favorite status for `id` and returns the new state. */
export function toggleFavorite(id: string): boolean {
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
      window.localStorage.setItem(KEY, raw);
    } catch {
      // quota / private mode — silently no-op
    }
  }
  cached = current;
  cachedRaw = raw;
  notify();
  return nowFav;
}
