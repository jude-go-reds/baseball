import { ImageResponse } from "next/og";
import { CARD_HEIGHT, CARD_WIDTH, type CardSide } from "@/lib/cards/types";
import { ModernFront } from "@/lib/cards/templates/modern/front";
import { ModernBack } from "@/lib/cards/templates/modern/back";
import { getDemoPlayer } from "@/lib/cards/demoData";

function parseSide(value: string | null): CardSide {
  return value === "back" ? "back" : "front";
}

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/card/[id]">,
) {
  const { id } = await ctx.params;
  const player = getDemoPlayer(id);

  if (!player) {
    return new Response(`No player found for id "${id}"`, { status: 404 });
  }

  const side = parseSide(new URL(request.url).searchParams.get("side"));
  const element =
    side === "back" ? <ModernBack player={player} /> : <ModernFront player={player} />;

  return new ImageResponse(element, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
