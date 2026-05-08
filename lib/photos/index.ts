import { getMlbPhotoUrl } from "./mlb";
import { getWikimediaPhotoUrl } from "./wikimedia";

// Process-local cache: id -> resolved URL (or null). Avoids re-resolving
// the same player on hot serverless instances. Cold starts re-resolve.
// Bounded with simple FIFO eviction so a long-lived Fluid Compute instance
// can't grow this map without limit.
const MAX_ENTRIES = 5000;
const cache = new Map<string, string | null>();

function setBounded(id: string, value: string | null) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(id, value);
}

export async function resolvePhoto(
  id: string,
  playerName: string,
): Promise<string | null> {
  if (cache.has(id)) return cache.get(id) ?? null;

  const mlb = await getMlbPhotoUrl(id);
  if (mlb) {
    setBounded(id, mlb);
    return mlb;
  }

  const wiki = await getWikimediaPhotoUrl(playerName);
  setBounded(id, wiki);
  return wiki;
}
