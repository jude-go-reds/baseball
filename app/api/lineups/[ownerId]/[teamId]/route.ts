import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { readLineups } from "../../route";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ ownerId: string; teamId: string }> },
) {
  const { ownerId, teamId } = await ctx.params;
  if (!ownerId || !teamId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  let user;
  try {
    const client = await clerkClient();
    user = await client.users.getUser(ownerId);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const lineups = readLineups(user.publicMetadata as Record<string, unknown>);
  const lineup = lineups.find((l) => l.id === teamId);
  if (!lineup) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const ownerName = user.username ?? user.firstName ?? null;
  return NextResponse.json({ lineup, ownerName });
}
