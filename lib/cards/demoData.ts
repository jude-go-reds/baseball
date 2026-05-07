import type { Player } from "./templates/modern";

export const RUTH: Player = {
  id: "ruth",
  name: "Babe Ruth",
  team: "BOS / NYY / BSN",
  position: "OF / P",
  years: "1914 - 1935",
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
