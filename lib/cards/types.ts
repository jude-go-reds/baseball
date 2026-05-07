export type HitterCareer = {
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  hr: number;
  rbi: number;
  h: number;
  r: number;
  sb: number;
};

export type Honors = {
  worldSeries: number;
  mvp: number;
  allStar: number;
  goldGlove: number;
  silverSlugger: number;
  cyYoung: number;
  hofYear: number | null;
};

export type Player = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
  photoUrl: string | null;
  honors: Honors;
  hitting: HitterCareer;
};

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 1120;

export type CardSide = "front" | "back";

export type AwardTile = { value: string; label: string };

export function buildAwardTiles(h: Honors): AwardTile[] {
  const tiles: AwardTile[] = [];
  if (h.hofYear) tiles.push({ value: String(h.hofYear), label: "Hall of Fame" });
  if (h.worldSeries) tiles.push({ value: String(h.worldSeries), label: "World Series" });
  if (h.mvp) tiles.push({ value: String(h.mvp), label: "MVP" });
  if (h.cyYoung) tiles.push({ value: String(h.cyYoung), label: "Cy Young" });
  if (h.allStar) tiles.push({ value: String(h.allStar), label: "All-Star" });
  if (h.goldGlove) tiles.push({ value: String(h.goldGlove), label: "Gold Glove" });
  if (h.silverSlugger) tiles.push({ value: String(h.silverSlugger), label: "Silver Slugger" });
  return tiles;
}
