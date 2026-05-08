import type { ReactElement } from "react";
import type { Player } from "../types";
import { ModernFront } from "./modern/front";
import { ModernBack } from "./modern/back";
import { VintageFront } from "./vintage/front";
import { VintageBack } from "./vintage/back";
import { MinimalistFront } from "./minimalist/front";
import { MinimalistBack } from "./minimalist/back";
import { Topps54Front } from "./topps54/front";
import { Topps54Back } from "./topps54/back";
import { Topps61Front } from "./topps61/front";
import { Topps61Back } from "./topps61/back";
import { Topps89Front } from "./topps89/front";
import { Topps89Back } from "./topps89/back";

export const STYLES = [
  "modern",
  "vintage",
  "minimalist",
  "topps54",
  "topps61",
  "topps89",
] as const;
export type Style = (typeof STYLES)[number];

export const STYLE_LABELS: Record<Style, string> = {
  modern: "Modern",
  vintage: "Vintage",
  minimalist: "Minimalist",
  topps54: "1954 Topps",
  topps61: "1961 Topps",
  topps89: "1989 Topps",
};

export const DEFAULT_STYLE: Style = "modern";

export function parseStyle(raw: string | null | undefined): Style {
  if (!raw) return DEFAULT_STYLE;
  return (STYLES as readonly string[]).includes(raw) ? (raw as Style) : DEFAULT_STYLE;
}

type Renderer = (props: { player: Player }) => ReactElement;

const TEMPLATES: Record<Style, { front: Renderer; back: Renderer }> = {
  modern: { front: ModernFront, back: ModernBack },
  vintage: { front: VintageFront, back: VintageBack },
  minimalist: { front: MinimalistFront, back: MinimalistBack },
  topps54: { front: Topps54Front, back: Topps54Back },
  topps61: { front: Topps61Front, back: Topps61Back },
  topps89: { front: Topps89Front, back: Topps89Back },
};

export function renderCard(
  style: Style,
  side: "front" | "back",
  player: Player,
): ReactElement {
  const { front, back } = TEMPLATES[style];
  const Cmp = side === "back" ? back : front;
  return <Cmp player={player} />;
}
