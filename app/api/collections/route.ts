import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MAX_COLLECTIONS = 20;
const MAX_PLAYERS_PER_COLLECTION = 100;
const MAX_NAME_LEN = 80;
const MAX_ID_LEN = 64;

export type Collection = {
  id: string;
  name: string;
  playerIds: string[];
  createdAt: number;
};

function sanitize(input: unknown): Collection | null {
  if (!input || typeof input !== "object") return null;
  const c = input as Record<string, unknown>;
  const id = typeof c.id === "string" && c.id.length > 0 ? c.id.slice(0, MAX_ID_LEN) : null;
  const nameRaw = typeof c.name === "string" ? c.name.trim().slice(0, MAX_NAME_LEN) : "";
  if (!id || !nameRaw) return null;
  const playerIds = Array.isArray(c.playerIds)
    ? c.playerIds
        .filter((x): x is string => typeof x === "string")
        .slice(0, MAX_PLAYERS_PER_COLLECTION)
    : [];
  const createdAt = typeof c.createdAt === "number" ? c.createdAt : Date.now();
  return { id, name: nameRaw, playerIds, createdAt };
}

function readCollections(publicMetadata: Record<string, unknown> | undefined): Collection[] {
  const raw = publicMetadata?.collections;
  if (!Array.isArray(raw)) return [];
  return raw.map(sanitize).filter((c): c is Collection => c !== null);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await currentUser();
  return NextResponse.json({ collections: readCollections(user?.publicMetadata) });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const incoming = (body as { collections?: unknown })?.collections;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const collections = incoming
    .slice(0, MAX_COLLECTIONS)
    .map(sanitize)
    .filter((c): c is Collection => c !== null);

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { collections },
  });

  return NextResponse.json({ ok: true, collections });
}
