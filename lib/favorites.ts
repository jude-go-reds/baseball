// Browser-local favorites for both players and teams. Backed by
// localStorage, exposed through useSyncExternalStore-friendly getters.
// Two independent stores share the same factory so the API stays uniform.
//
// When the user is signed in, FavoritesSyncProvider installs a remote
// writer via setRemoteSync; the store still keeps localStorage in sync
// (so reads are instant) but every toggle also fires the remote writer.

import { STYLES, type Style } from "@/lib/cards/templates/registry";

const EMPTY: string[] = [];
const EMPTY_STYLES: Record<string, Style> = {};

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

const STYLE_SET = new Set<string>(STYLES);
function isStyle(x: unknown): x is Style {
  return typeof x === "string" && STYLE_SET.has(x);
}

// Defense-in-depth against tampered/restored localStorage payloads. Values
// that pass `isStyle` are safe constants, but a key like `__proto__` would
// still have its assignment silently dropped by the engine — explicit skip
// keeps behavior predictable across JS hosts.
function isSafeKey(k: string): boolean {
  return k !== "__proto__" && k !== "constructor" && k !== "prototype";
}

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

// Per-player captured style, persisted alongside the favorites set.
// Recorded when the user toggles a favorite ON; removed when toggled OFF.
// Lets `/library` link straight to the design that was active at favorite-time.
const STYLES_KEY = "baseball-cards.favoriteStyles";

type StylesMap = Record<string, Style>;
type StylesRemoteWriter = (map: StylesMap) => void;

let stylesCached: StylesMap = {};
let stylesCachedRaw = "\x00";
let stylesRemoteSync: StylesRemoteWriter | null = null;
const stylesListeners = new Set<() => void>();

function stylesReadNow(): StylesMap {
  if (typeof window === "undefined") return stylesCached;
  const raw = window.localStorage.getItem(STYLES_KEY) ?? "";
  if (raw === stylesCachedRaw) return stylesCached;
  stylesCachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const next: StylesMap = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof k === "string" && isSafeKey(k) && isStyle(v)) next[k] = v;
      }
      stylesCached = next;
    } else {
      stylesCached = {};
    }
  } catch {
    stylesCached = {};
  }
  return stylesCached;
}

function stylesNotify() {
  for (const fn of stylesListeners) fn();
}

function stylesWriteLocal(map: StylesMap, raw: string) {
  if (typeof window !== "undefined") {
    try {
      if (Object.keys(map).length === 0) window.localStorage.removeItem(STYLES_KEY);
      else window.localStorage.setItem(STYLES_KEY, raw);
    } catch {
      // quota / private mode — silently no-op
    }
  }
}

function stylesCommit(next: StylesMap, fromRemote: boolean) {
  const raw = JSON.stringify(next);
  stylesCached = next;
  stylesCachedRaw = raw;
  stylesWriteLocal(next, raw);
  stylesNotify();
  if (!fromRemote && stylesRemoteSync) stylesRemoteSync(next);
}

export function subscribeFavoriteStyles(cb: () => void): () => void {
  stylesListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STYLES_KEY) cb();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    stylesListeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getFavoriteStyles(): StylesMap {
  return stylesReadNow();
}

export function getFavoriteStylesServerSnapshot(): StylesMap {
  return EMPTY_STYLES;
}

export function getFavoriteStyle(id: string): Style | undefined {
  return stylesReadNow()[id];
}

export function setAllFavoriteStyles(map: StylesMap) {
  const next: StylesMap = {};
  for (const [k, v] of Object.entries(map)) {
    if (typeof k === "string" && isSafeKey(k) && isStyle(v)) next[k] = v;
  }
  stylesCommit(next, true);
}

export function setRemoteFavoriteStylesSync(writer: StylesRemoteWriter | null) {
  stylesRemoteSync = writer;
}

function clearFavoriteStyles() {
  stylesCommit({}, false);
}

// Players (existing API kept for backwards compat with all consumers).
export const subscribeFavorites = players.subscribe;
export const getFavorites = players.getSnapshot;
export const getFavoritesServerSnapshot = players.getServerSnapshot;
export const isFavorite = players.has;

/**
 * Toggle a player favorite. When `style` is provided and the toggle adds
 * the favorite, the style is recorded so future links (e.g. /library) can
 * default the card page to the design that was active at favorite-time.
 * When the toggle removes a favorite, any recorded style is dropped.
 */
export function toggleFavorite(id: string, style?: Style): boolean {
  const nowFav = players.toggle(id);
  const current = stylesReadNow();
  if (nowFav) {
    if (style && isSafeKey(id) && current[id] !== style) {
      stylesCommit({ ...current, [id]: style }, false);
    }
  } else if (Object.prototype.hasOwnProperty.call(current, id)) {
    const next = { ...current };
    delete next[id];
    stylesCommit(next, false);
  }
  return nowFav;
}

export const setAllFavorites = players.setAll;
export function clearFavorites() {
  players.clear();
  clearFavoriteStyles();
}
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
