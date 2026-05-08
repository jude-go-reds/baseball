import type { Player } from "../../types";
import { primaryTeamLogoUrl } from "@/lib/teams/logos";

// 1989 Upper Deck: clean white card stock, "UPPER DECK '89" wordmark in
// a black bar with a faux-holographic UD hex up top, big photo, and a
// green/gold team-color slab at the bottom carrying the player name.
// (Slug stays `topps89` so existing URLs keep working.)

const PAPER = "#fafaf7";
const INK = "#0d1721";
const NAVY = "#102a55";
const GREEN = "#1f6f43";
const GOLD = "#d4af37";
const SILVER = "#cfcfcf";

export function Topps89Front({ player }: { player: Player }) {
  const logo = primaryTeamLogoUrl(player.team);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        padding: 18,
        boxSizing: "border-box",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          background: PAPER,
          border: `2px solid ${INK}`,
          overflow: "hidden",
        }}
      >
        {/* Top black bar with UPPER DECK wordmark + holo UD hex */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: INK,
            color: PAPER,
            padding: "8px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 6,
                color: GOLD,
                textTransform: "uppercase",
              }}
            >
              Upper Deck
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 10,
                fontSize: 18,
                fontWeight: 900,
                fontStyle: "italic",
                color: PAPER,
              }}
            >
              {String.fromCharCode(0x2019)}89
            </div>
          </div>
          <HoloBadge />
        </div>

        {/* Photo */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#e8e6df",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {player.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photoUrl}
              alt={player.name}
              width={760}
              height={780}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                color: NAVY,
                fontSize: 28,
                letterSpacing: 6,
                fontWeight: 800,
              }}
            >
              NO PHOTO
            </div>
          )}

          {/* Team logo cap, bottom-left */}
          {logo && (
            <div
              style={{
                position: "absolute",
                left: 14,
                bottom: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 76,
                height: 76,
                background: PAPER,
                border: `2px solid ${INK}`,
                borderRadius: 999,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt=""
                width={56}
                height={56}
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>

        {/* Bottom team-color slab */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              background: GREEN,
              color: PAPER,
              padding: "20px 24px 16px",
              borderTop: `4px solid ${GOLD}`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: -1,
                textTransform: "uppercase",
                flex: 1,
              }}
            >
              {player.name}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: PAPER,
              color: INK,
              borderTop: `2px solid ${INK}`,
              padding: "8px 16px",
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 800,
            }}
          >
            <div style={{ display: "flex", color: GREEN }}>{player.position || "—"}</div>
            <div style={{ display: "flex", margin: "0 10px", color: SILVER }}>
              {String.fromCharCode(0x2022)}
            </div>
            <div style={{ display: "flex", flex: 1 }}>{player.team}</div>
            <div style={{ display: "flex", color: NAVY }}>{player.years}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stylized "holographic" UD hex badge — gold/silver gradient pill with UD.
function HoloBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 32,
        background: `linear-gradient(135deg, #f1d27a 0%, #cfcfcf 50%, #f1d27a 100%)`,
        border: `1px solid #0d1721`,
        color: "#0d1721",
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: 2,
      }}
    >
      UD
    </div>
  );
}
