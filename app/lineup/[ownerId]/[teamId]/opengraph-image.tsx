import { ImageResponse } from "next/og";
import { clerkClient } from "@clerk/nextjs/server";
import { readLineups } from "@/app/api/lineups/route";
import { getAll } from "@/lib/players/searchIndex";
import { mlbPhotoUrl } from "@/lib/photos/mlb";
import { type Slot, SLOTS } from "@/lib/lineups/positions";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Baseball lineup on the field";

// Slot positions tuned for the 1200x560 field area (everything below the
// 70px title bar). Wider than the in-app field so the diamond is flatter.
const POS: Record<Exclude<Slot, "RP" | "DH">, { left: number; top: number }> = {
  CF: { left: 50, top: 12 },
  LF: { left: 16, top: 24 },
  RF: { left: 84, top: 24 },
  SS: { left: 40, top: 46 },
  "2B": { left: 60, top: 42 },
  "3B": { left: 22, top: 56 },
  "1B": { left: 78, top: 60 },
  P: { left: 50, top: 56 },
  C: { left: 50, top: 86 },
};
const FIELD_SLOTS: Array<Exclude<Slot, "RP" | "DH">> = [
  "CF",
  "LF",
  "RF",
  "SS",
  "2B",
  "3B",
  "1B",
  "P",
  "C",
];

const TITLE_HEIGHT = 70;
const FIELD_HEIGHT = size.height - TITLE_HEIGHT;

const PAPER = "#fafaf7";
const INK = "#0d1721";
const NAVY = "#102a55";
const GREEN = "#1f7a3a";
const DARK_GREEN = "#0f4a26";
const DIRT = "#a16225";
const GOLD = "#d4af37";

export default async function OgImage({
  params,
}: {
  params: Promise<{ ownerId: string; teamId: string }>;
}) {
  const { ownerId, teamId } = await params;

  let user;
  try {
    const client = await clerkClient();
    user = await client.users.getUser(ownerId);
  } catch {
    return notFoundResponse();
  }
  const lineups = readLineups(user.publicMetadata as Record<string, unknown>);
  const lineup = lineups.find((l) => l.id === teamId);
  if (!lineup) return notFoundResponse();

  const ownerName = user.username ?? user.firstName ?? "a fan";
  const all = getAll();
  const byId = new Map(all.map((p) => [p.id, p]));
  const filled = SLOTS.filter((s) => Boolean(lineup.slots[s])).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          background: GREEN,
        }}
      >
        {/* Title strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: TITLE_HEIGHT,
            padding: "0 32px",
            background: NAVY,
            color: PAPER,
            borderBottom: `4px solid ${GOLD}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: -0.5,
              }}
            >
              {lineup.name}
            </span>
            <span style={{ fontSize: 16, color: GOLD }}>
              by {ownerName}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            <span>{filled}/{SLOTS.length} filled</span>
            <span style={{ color: PAPER, fontWeight: 800 }}>Stat Cards</span>
          </div>
        </div>

        {/* Field area */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: FIELD_HEIGHT,
            background: GREEN,
          }}
        >
          {/* Foul lines + dirt fan */}
          <FieldBackground />

          {/* 9 fielding slots, positioned by percentage */}
          {FIELD_SLOTS.map((slot) => {
            const id = lineup.slots[slot];
            const entry = id ? byId.get(id) ?? null : null;
            const pos = POS[slot];
            return (
              <SlotMarker
                key={slot}
                slot={slot}
                playerId={id ?? null}
                lastName={entry ? entry.name.split(" ").slice(-1)[0] : null}
                left={pos.left}
                top={pos.top}
              />
            );
          })}

          {/* Bench slots (RP / DH) — pinned to bottom corners */}
          <BenchMarker
            slot="RP"
            playerId={lineup.slots.RP ?? null}
            entry={lineup.slots.RP ? byId.get(lineup.slots.RP) ?? null : null}
            corner="left"
          />
          <BenchMarker
            slot="DH"
            playerId={lineup.slots.DH ?? null}
            entry={lineup.slots.DH ? byId.get(lineup.slots.DH) ?? null : null}
            corner="right"
          />
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, s-maxage=600, stale-while-revalidate=86400",
      },
    },
  );
}

function FieldBackground() {
  // The OG field is wider than tall, so the diamond is flattened. We render
  // the green outfield, the dirt fan from home plate, and the inner grass
  // diamond. Bases are skipped to keep the image readable at thumbnail size.
  return (
    <svg
      width={size.width}
      height={FIELD_HEIGHT}
      viewBox={`0 0 ${size.width} ${FIELD_HEIGHT}`}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <rect width={size.width} height={FIELD_HEIGHT} fill={GREEN} />
      {/* Foul-territory shading at the corners */}
      <path
        d={`M 600 ${FIELD_HEIGHT - 30} L 80 80 L 0 80 L 0 ${FIELD_HEIGHT} L 600 ${FIELD_HEIGHT} Z`}
        fill={DARK_GREEN}
        opacity="0.5"
      />
      <path
        d={`M 600 ${FIELD_HEIGHT - 30} L 1120 80 L 1200 80 L 1200 ${FIELD_HEIGHT} L 600 ${FIELD_HEIGHT} Z`}
        fill={DARK_GREEN}
        opacity="0.5"
      />
      {/* Skinned infield (dirt fan from home) */}
      <path
        d={`M 600 ${FIELD_HEIGHT - 30} L 380 ${FIELD_HEIGHT - 250} A 320 320 0 0 1 820 ${FIELD_HEIGHT - 250} Z`}
        fill={DIRT}
      />
      {/* Inner grass diamond */}
      <polygon
        points={`600,${FIELD_HEIGHT - 70} 740,${FIELD_HEIGHT - 200} 600,${FIELD_HEIGHT - 330} 460,${FIELD_HEIGHT - 200}`}
        fill={GREEN}
      />
      {/* Foul lines */}
      <line
        x1="600"
        y1={FIELD_HEIGHT - 30}
        x2="80"
        y2="80"
        stroke="white"
        strokeWidth="3"
      />
      <line
        x1="600"
        y1={FIELD_HEIGHT - 30}
        x2="1120"
        y2="80"
        stroke="white"
        strokeWidth="3"
      />
      {/* Pitcher's mound */}
      <circle
        cx="600"
        cy={FIELD_HEIGHT - 220}
        r="34"
        fill={DIRT}
      />
      {/* Home plate */}
      <polygon
        points={`580,${FIELD_HEIGHT - 40} 620,${FIELD_HEIGHT - 40} 620,${FIELD_HEIGHT - 25} 600,${FIELD_HEIGHT - 10} 580,${FIELD_HEIGHT - 25}`}
        fill="white"
      />
    </svg>
  );
}

function SlotMarker({
  slot,
  playerId,
  lastName,
  left,
  top,
}: {
  slot: Slot;
  playerId: string | null;
  lastName: string | null;
  left: number;
  top: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar playerId={playerId} slot={slot} size={88} />
      <div
        style={{
          marginTop: 4,
          padding: "2px 8px",
          background: "rgba(0,0,0,0.65)",
          color: PAPER,
          fontSize: 14,
          fontWeight: 800,
          borderRadius: 4,
        }}
      >
        {lastName ?? slot}
      </div>
    </div>
  );
}

function BenchMarker({
  slot,
  playerId,
  entry,
  corner,
}: {
  slot: Slot;
  playerId: string | null;
  entry: { name: string } | null;
  corner: "left" | "right";
}) {
  const lastName = entry ? entry.name.split(" ").slice(-1)[0] : null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        [corner === "left" ? "left" : "right"]: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        background: "rgba(0,0,0,0.55)",
        borderRadius: 999,
        color: PAPER,
      }}
    >
      <Avatar playerId={playerId} slot={slot} size={48} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 2 }}>
          {slot}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800 }}>
          {lastName ?? "—"}
        </span>
      </div>
    </div>
  );
}

function Avatar({
  playerId,
  slot,
  size: avatarSize,
}: {
  playerId: string | null;
  slot: Slot;
  size: number;
}) {
  const ring = `3px solid ${PAPER}`;
  if (playerId) {
    return (
      <div
        style={{
          display: "flex",
          width: avatarSize,
          height: avatarSize,
          borderRadius: 999,
          overflow: "hidden",
          border: ring,
          background: PAPER,
        }}
      >
        <img
          src={mlbPhotoUrl(playerId)}
          alt=""
          width={avatarSize}
          height={avatarSize}
          style={{
            width: avatarSize,
            height: avatarSize,
            objectFit: "cover",
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: avatarSize,
        height: avatarSize,
        borderRadius: 999,
        border: ring,
        background: PAPER,
        color: INK,
        fontSize: avatarSize * 0.32,
        fontWeight: 900,
      }}
    >
      {slot}
    </div>
  );
}

function notFoundResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: NAVY,
          color: PAPER,
          fontFamily: "sans-serif",
          fontSize: 48,
          fontWeight: 900,
        }}
      >
        Lineup not found
      </div>
    ),
    { ...size },
  );
}
