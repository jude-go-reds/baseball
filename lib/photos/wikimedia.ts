// Wikipedia/Wikimedia fallback for players whose MLB headshot is the
// generic silhouette. Hits the page-summary REST endpoint, which returns a
// `thumbnail.source` URL when the article has a lead image.

const UA = "BaseballCardsApp/0.1 (https://baseball-beta-sepia.vercel.app)";

type WikiSummary = {
  thumbnail?: { source?: string; width?: number; height?: number };
  originalimage?: { source?: string };
  type?: string;
};

function pageTitle(name: string): string {
  return encodeURIComponent(name.trim().replace(/\s+/g, "_"));
}

export async function getWikimediaPhotoUrl(
  playerName: string,
): Promise<string | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle(playerName)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    if (data.type === "disambiguation") return null;
    return data.thumbnail?.source ?? data.originalimage?.source ?? null;
  } catch {
    return null;
  }
}
