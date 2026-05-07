import { ImageResponse } from "next/og";
import { CARD_HEIGHT, CARD_WIDTH, ModernCard } from "@/lib/cards/templates/modern";
import { getDemoPlayer } from "@/lib/cards/demoData";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/card/[id]">,
) {
  const { id } = await ctx.params;
  const player = getDemoPlayer(id);

  if (!player) {
    return new Response(`No player found for id "${id}"`, { status: 404 });
  }

  return new ImageResponse(<ModernCard player={player} />, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
