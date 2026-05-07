import { ImageResponse } from "next/og";
import { CARD_HEIGHT, CARD_WIDTH, type CardSide } from "@/lib/cards/types";
import { parseStyle, renderCard } from "@/lib/cards/templates/registry";
import { getPlayer } from "@/lib/players/getPlayer";

function parseSide(value: string | null): CardSide {
  return value === "back" ? "back" : "front";
}

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/card/[id]">,
) {
  const { id } = await ctx.params;
  const player = await getPlayer(id);

  if (!player) {
    return new Response(`No player found for id "${id}"`, { status: 404 });
  }

  const url = new URL(request.url);
  const side = parseSide(url.searchParams.get("side"));
  const style = parseStyle(url.searchParams.get("style"));

  return new ImageResponse(renderCard(style, side, player), {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
