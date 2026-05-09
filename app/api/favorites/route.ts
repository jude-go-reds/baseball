import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { STYLES, type Style } from "@/lib/cards/templates/registry";

const MAX_PLAYERS = 500;
const MAX_TEAMS = 50;
const STYLE_SET = new Set<string>(STYLES);

type PlayerStyles = Record<string, Style>;
type Favorites = { players: string[]; teams: string[]; playerStyles: PlayerStyles };

function isSafeKey(k: string): boolean {
  return k !== "__proto__" && k !== "constructor" && k !== "prototype";
}

function sanitizeStyles(
  raw: unknown,
  validIds: ReadonlySet<string>,
): PlayerStyles {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: PlayerStyles = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (
      typeof k === "string" &&
      isSafeKey(k) &&
      typeof v === "string" &&
      STYLE_SET.has(v) &&
      validIds.has(k)
    ) {
      out[k] = v as Style;
    }
  }
  return out;
}

function readFromUser(privateMetadata: Record<string, unknown> | undefined): Favorites {
  const fav = (privateMetadata?.favorites ?? {}) as Partial<Favorites> & {
    playerStyles?: unknown;
  };
  const players = Array.isArray(fav.players)
    ? fav.players.filter((x): x is string => typeof x === "string").slice(0, MAX_PLAYERS)
    : [];
  const teams = Array.isArray(fav.teams)
    ? fav.teams.filter((x): x is string => typeof x === "string").slice(0, MAX_TEAMS)
    : [];
  const playerStyles = sanitizeStyles(fav.playerStyles, new Set(players));
  return { players, teams, playerStyles };
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

  const incoming = body as (Partial<Favorites> & { playerStyles?: unknown }) | null;
  const players = Array.isArray(incoming?.players)
    ? incoming.players.filter((x): x is string => typeof x === "string").slice(0, MAX_PLAYERS)
    : [];
  const teams = Array.isArray(incoming?.teams)
    ? incoming.teams.filter((x): x is string => typeof x === "string").slice(0, MAX_TEAMS)
    : [];
  const playerStyles = sanitizeStyles(incoming?.playerStyles, new Set(players));

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { favorites: { players, teams, playerStyles } },
  });

  return NextResponse.json({ ok: true, players, teams, playerStyles });
}
