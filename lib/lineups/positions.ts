// Slot definitions for the fantasy lineup. The 9 fielding positions plus
// a relief pitcher and a designated hitter — 11 total.
//
// `slotAccepts` decides whether a player's index `position` is eligible
// for a given slot when the lineup's positionLock is on. The MLB Stats
// API position field can be a primary single-letter code (P, C), an
// infield/outfield rollup (IF, OF), TWP for two-way players, or X for
// unknown. We're permissive on rollups and two-way.

export const SLOTS = [
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "RP",
  "DH",
] as const;

export type Slot = (typeof SLOTS)[number];

export const SLOT_LABEL: Record<Slot, string> = {
  P: "Pitcher",
  C: "Catcher",
  "1B": "First Base",
  "2B": "Second Base",
  "3B": "Third Base",
  SS: "Shortstop",
  LF: "Left Field",
  CF: "Center Field",
  RF: "Right Field",
  RP: "Relief Pitcher",
  DH: "Designated Hitter",
};

const PITCHER_SLOTS: ReadonlySet<Slot> = new Set(["P", "RP"]);
const OUTFIELD_SLOTS: ReadonlySet<Slot> = new Set(["LF", "CF", "RF"]);
const INFIELD_SLOTS: ReadonlySet<Slot> = new Set(["1B", "2B", "3B", "SS"]);

export function slotAccepts(slot: Slot, position: string): boolean {
  const p = (position || "").toUpperCase();
  if (!p || p === "X") return false;
  // Two-way players (Ohtani-likes) are eligible everywhere.
  if (p === "TWP") return true;
  // Utility / pinch-hitters: hitters who can fit DH or any non-pitcher slot.
  if (p === "UT" || p === "PH") return !PITCHER_SLOTS.has(slot);
  if (PITCHER_SLOTS.has(slot)) return p === "P" || p === "SP" || p === "RP";
  if (slot === "DH") return p !== "P" && p !== "SP" && p !== "RP";
  if (OUTFIELD_SLOTS.has(slot)) return p === slot || p === "OF";
  if (INFIELD_SLOTS.has(slot)) return p === slot || p === "IF";
  if (slot === "C") return p === "C";
  return false;
}
