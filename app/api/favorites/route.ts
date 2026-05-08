import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MAX_PLAYERS = 500;
const MAX_TEAMS = 50;

type Favorites = { players: string[]; teams: string[] };

function readFromUser(privateMetadata: Record<string, unknown> | undefined): Favorites {
  const fav = (privateMetadata?.favorites ?? {}) as Partial<Favorites>;
  return {
    players: Array.isArray(fav.players)
      ? fav.players.filter((x): x is string => typeof x === "string").slice(0, MAX_PLAYERS)
      : [],
    teams: Array.isArray(fav.teams)
      ? fav.teams.filter((x): x is string => typeof x === "string").slice(0, MAX_TEAMS)
      : [],
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await currentUser();
  return NextResponse.json(readFromUser(user?.privateMetadata));
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const incoming = body as Partial<Favorites> | null;
  const players = Array.isArray(incoming?.players)
    ? incoming.players.filter((x): x is string => typeof x === "string").slice(0, MAX_PLAYERS)
    : [];
  const teams = Array.isArray(incoming?.teams)
    ? incoming.teams.filter((x): x is string => typeof x === "string").slice(0, MAX_TEAMS)
    : [];

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { favorites: { players, teams } },
  });

  return NextResponse.json({ ok: true, players, teams });
}
