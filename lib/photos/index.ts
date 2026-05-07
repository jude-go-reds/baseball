import { getMlbPhotoUrl } from "./mlb";
import { getWikimediaPhotoUrl } from "./wikimedia";

// Process-local cache: id -> resolved URL (or null). Avoids re-resolving
// the same player on hot serverless instances. Cold starts re-resolve.
const cache = new Map<string, string | null>();

export async function resolvePhoto(
  id: string,
  playerName: string,
): Promise<string | null> {
  if (cache.has(id)) return cache.get(id) ?? null;

  const mlb = await getMlbPhotoUrl(id);
  if (mlb) {
    cache.set(id, mlb);
    return mlb;
  }

  const wiki = await getWikimediaPhotoUrl(playerName);
  cache.set(id, wiki);
  return wiki;
}
