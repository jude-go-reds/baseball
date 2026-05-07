import type { Player } from "./types";

export const RUTH: Player = {
  id: "ruth",
  name: "Babe Ruth",
  team: "BOS / NYY / BSN",
  position: "OF / P",
  years: "1914 - 1935",
  photoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Babe_Ruth2.jpg/330px-Babe_Ruth2.jpg",
  honors: {
    worldSeries: 7,
    mvp: 1,
    allStar: 2,
    goldGlove: 0,
    silverSlugger: 0,
    cyYoung: 0,
    hofYear: 1936,
  },
  hitting: {
    avg: ".342",
    obp: ".474",
    slg: ".690",
    ops: "1.164",
    hr: 714,
    rbi: 2214,
    h: 2873,
    r: 2174,
    sb: 123,
  },
};

export function getDemoPlayer(id: string): Player | null {
  if (id === "ruth") return RUTH;
  return null;
}
