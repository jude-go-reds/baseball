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

export function buildHonorsStrip(h: Honors): string[] {
  const items: string[] = [];
  if (h.hofYear) items.push(`HoF ${h.hofYear}`);
  if (h.worldSeries) items.push(`${h.worldSeries}× WS`);
  if (h.mvp) items.push(`${h.mvp}× MVP`);
  if (h.cyYoung) items.push(`${h.cyYoung}× CY`);
  if (h.allStar) items.push(`${h.allStar}× AS`);
  if (h.goldGlove) items.push(`${h.goldGlove}× GG`);
  if (h.silverSlugger) items.push(`${h.silverSlugger}× SS`);
  return items;
}
