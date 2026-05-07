import type { ReactElement } from "react";
import type { Player } from "../types";
import { ModernFront } from "./modern/front";
import { ModernBack } from "./modern/back";
import { VintageFront } from "./vintage/front";
import { VintageBack } from "./vintage/back";
import { MinimalistFront } from "./minimalist/front";
import { MinimalistBack } from "./minimalist/back";

export const STYLES = ["modern", "vintage", "minimalist"] as const;
export type Style = (typeof STYLES)[number];

export const STYLE_LABELS: Record<Style, string> = {
  modern: "Modern",
  vintage: "Vintage",
  minimalist: "Minimalist",
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
