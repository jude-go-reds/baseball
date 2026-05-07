// MLB's midfield endpoint serves a 240×240 PNG. For players with no real
// headshot it falls back to a generic silhouette that is consistently 7423
// bytes — we use Content-Length to skip those and let Wikimedia try next.

const SILHOUETTE_BYTES = 7423;

export function mlbPhotoUrl(id: string): string {
  return `https://midfield.mlbstatic.com/v1/people/${id}/spots/240`;
}

export async function getMlbPhotoUrl(id: string): Promise<string | null> {
  const url = mlbPhotoUrl(id);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const len = Number(res.headers.get("content-length") ?? "0");
    if (len === SILHOUETTE_BYTES) return null;
    return url;
  } catch {
    return null;
  }
}
