// Client-side store for the signed-in user's collections. There is no
// localStorage fallback — collections are a sign-in-only feature.
//
// All mutations are optimistic: we update the in-memory cache + notify
// listeners first (instant UI), then PUT the full list to the server.
// On error we refetch from the server to recover.

export type Collection = {
  id: string;
  name: string;
  playerIds: string[];
  createdAt: number;
};

const EMPTY: Collection[] = [];

let cached: Collection[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

function setCache(next: Collection[]) {
  cached = next;
  loaded = true;
  notify();
}

export function subscribeCollections(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getCollectionsSnapshot(): Collection[] {
  return cached;
}

export function getCollectionsServerSnapshot(): Collection[] {
  return EMPTY;
}

export function isCollectionsLoaded(): boolean {
  return loaded;
}

export function clearCollections() {
  cached = EMPTY;
  loaded = false;
  notify();
}

async function pushAll(next: Collection[]): Promise<Collection[]> {
  const res = await fetch("/api/collections", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collections: next }),
  });
  if (!res.ok) throw new Error(`collections PUT ${res.status}`);
  const data = (await res.json()) as { collections?: Collection[] };
  return data.collections ?? next;
}

export async function refetchCollections(): Promise<void> {
  const res = await fetch("/api/collections", { cache: "no-store" });
  if (!res.ok) {
    setCache(EMPTY);
    return;
  }
  const data = (await res.json()) as { collections?: Collection[] };
  setCache(data.collections ?? []);
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function withOptimistic(
  next: Collection[],
  rollbackFrom: Collection[],
): Promise<Collection[]> {
  setCache(next);
  try {
    const server = await pushAll(next);
    setCache(server);
    return server;
  } catch (err) {
    setCache(rollbackFrom);
    throw err;
  }
}

export async function createCollection(name: string): Promise<Collection> {
  const collection: Collection = {
    id: newId(),
    name: name.trim(),
    playerIds: [],
    createdAt: Date.now(),
  };
  await withOptimistic([...cached, collection], cached);
  return collection;
}

export async function renameCollection(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = cached.map((c) => (c.id === id ? { ...c, name: trimmed } : c));
  await withOptimistic(next, cached);
}

export async function deleteCollection(id: string): Promise<void> {
  const next = cached.filter((c) => c.id !== id);
  await withOptimistic(next, cached);
}

export async function addPlayerToCollection(
  collectionId: string,
  playerId: string,
): Promise<void> {
  const next = cached.map((c) => {
    if (c.id !== collectionId) return c;
    if (c.playerIds.includes(playerId)) return c;
    return { ...c, playerIds: [...c.playerIds, playerId] };
  });
  await withOptimistic(next, cached);
}

export async function removePlayerFromCollection(
  collectionId: string,
  playerId: string,
): Promise<void> {
  const next = cached.map((c) =>
    c.id === collectionId
      ? { ...c, playerIds: c.playerIds.filter((id) => id !== playerId) }
      : c,
  );
  await withOptimistic(next, cached);
}
