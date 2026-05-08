// Client-side store for the signed-in user's fantasy lineups. Mirrors
// `lib/collections.ts`: in-memory cache with optimistic mutations and a
// PUT-the-whole-list write strategy. Sign-in only — no localStorage.

import type { Slot } from "./lineups/positions";

export type Lineup = {
  id: string;
  name: string;
  positionLock: boolean;
  slots: Partial<Record<Slot, string>>;
  createdAt: number;
};

const EMPTY: Lineup[] = [];

let cached: Lineup[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

function setCache(next: Lineup[]) {
  cached = next;
  loaded = true;
  notify();
}

export function subscribeLineups(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getLineupsSnapshot(): Lineup[] {
  return cached;
}

export function getLineupsServerSnapshot(): Lineup[] {
  return EMPTY;
}

export function isLineupsLoaded(): boolean {
  return loaded;
}

export function clearLineups() {
  cached = EMPTY;
  loaded = false;
  notify();
}

async function pushAll(next: Lineup[]): Promise<Lineup[]> {
  const res = await fetch("/api/lineups", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lineups: next }),
  });
  if (!res.ok) throw new Error(`lineups PUT ${res.status}`);
  const data = (await res.json()) as { lineups?: Lineup[] };
  return data.lineups ?? next;
}

export async function refetchLineups(): Promise<void> {
  const res = await fetch("/api/lineups", { cache: "no-store" });
  if (!res.ok) {
    setCache(EMPTY);
    return;
  }
  const data = (await res.json()) as { lineups?: Lineup[] };
  setCache(data.lineups ?? []);
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function withOptimistic(
  next: Lineup[],
  rollbackFrom: Lineup[],
): Promise<Lineup[]> {
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

export async function createLineup(name: string): Promise<Lineup> {
  const lineup: Lineup = {
    id: newId(),
    name: name.trim(),
    positionLock: true,
    slots: {},
    createdAt: Date.now(),
  };
  await withOptimistic([...cached, lineup], cached);
  return lineup;
}

export async function renameLineup(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = cached.map((l) => (l.id === id ? { ...l, name: trimmed } : l));
  await withOptimistic(next, cached);
}

export async function deleteLineup(id: string): Promise<void> {
  const next = cached.filter((l) => l.id !== id);
  await withOptimistic(next, cached);
}

export async function setSlot(
  lineupId: string,
  slot: Slot,
  playerId: string,
): Promise<void> {
  const next = cached.map((l) =>
    l.id === lineupId ? { ...l, slots: { ...l.slots, [slot]: playerId } } : l,
  );
  await withOptimistic(next, cached);
}

export async function clearSlot(lineupId: string, slot: Slot): Promise<void> {
  const next = cached.map((l) => {
    if (l.id !== lineupId) return l;
    const slots = { ...l.slots };
    delete slots[slot];
    return { ...l, slots };
  });
  await withOptimistic(next, cached);
}

export async function setPositionLock(
  lineupId: string,
  locked: boolean,
): Promise<void> {
  const next = cached.map((l) =>
    l.id === lineupId ? { ...l, positionLock: locked } : l,
  );
  await withOptimistic(next, cached);
}
