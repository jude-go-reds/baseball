import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SLOTS, type Slot } from "@/lib/lineups/positions";

const MAX_LINEUPS = 10;
const MAX_NAME_LEN = 80;
const MAX_ID_LEN = 64;
const MAX_PLAYER_ID_LEN = 32;

type StoredLineup = {
  id: string;
  name: string;
  positionLock: boolean;
  slots: Partial<Record<Slot, string>>;
  createdAt: number;
};

const SLOT_SET: ReadonlySet<string> = new Set(SLOTS);

function sanitizeSlots(input: unknown): Partial<Record<Slot, string>> {
  if (!input || typeof input !== "object") return {};
  const out: Partial<Record<Slot, string>> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!SLOT_SET.has(key)) continue;
    if (typeof value !== "string" || !value) continue;
    out[key as Slot] = value.slice(0, MAX_PLAYER_ID_LEN);
  }
  return out;
}

function sanitize(input: unknown): StoredLineup | null {
  if (!input || typeof input !== "object") return null;
  const l = input as Record<string, unknown>;
  const id = typeof l.id === "string" && l.id.length > 0 ? l.id.slice(0, MAX_ID_LEN) : null;
  const nameRaw = typeof l.name === "string" ? l.name.trim().slice(0, MAX_NAME_LEN) : "";
  if (!id || !nameRaw) return null;
  const positionLock = l.positionLock !== false; // default true
  const slots = sanitizeSlots(l.slots);
  const createdAt = typeof l.createdAt === "number" ? l.createdAt : Date.now();
  return { id, name: nameRaw, positionLock, slots, createdAt };
}

export function readLineups(
  publicMetadata: Record<string, unknown> | undefined,
): StoredLineup[] {
  const raw = publicMetadata?.lineups;
  if (!Array.isArray(raw)) return [];
  return raw.map(sanitize).filter((l): l is StoredLineup => l !== null);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await currentUser();
  return NextResponse.json({ lineups: readLineups(user?.publicMetadata) });
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

  const incoming = (body as { lineups?: unknown })?.lineups;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const lineups = incoming
    .slice(0, MAX_LINEUPS)
    .map(sanitize)
    .filter((l): l is StoredLineup => l !== null);

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { lineups },
  });

  return NextResponse.json({ ok: true, lineups });
}
