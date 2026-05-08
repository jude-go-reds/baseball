import type { Player } from "../../types";

// 1954 Topps: solid bright background, large portrait, big block-letter name,
// team pennant + position roundel, signature stripe across the photo.

const BG = "#d24a3e";       // bright tomato red
const BG_DARK = "#9a2f25";
const CREAM = "#f4ecd2";
const INK = "#1a0e0a";
const PENNANT = "#1f2c5c";  // navy pennant

export function Topps54Front({ player }: { player: Player }) {
  const lastName = lastWord(player.name);
  const firstName = firstWords(player.name);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BG,
        padding: 22,
        boxSizing: "border-box",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          background: BG,
          border: `4px solid ${CREAM}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top: big stacked name, pennant on the right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 28px 10px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 48,
                fontWeight: 900,
                color: CREAM,
                lineHeight: 0.95,
                letterSpacing: -0.5,
                textTransform: "uppercase",
                fontFamily: "serif",
              }}
            >
              {firstName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 86,
                fontWeight: 900,
                color: CREAM,
                lineHeight: 0.9,
                letterSpacing: -2,
                textTransform: "uppercase",
                marginTop: 4,
                fontFamily: "serif",
              }}
            >
              {lastName}
            </div>
          </div>

          {/* Pennant flag with team name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              background: PENNANT,
              color: CREAM,
              padding: "10px 18px 10px 14px",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: `2px solid ${CREAM}`,
              transform: "rotate(-4deg)",
              maxWidth: 280,
              fontFamily: "serif",
            }}
          >
            {player.team || "TEAM"}
          </div>
        </div>

        {/* Photo block — generous frame, cream border, clipped portrait */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            margin: "0 28px",
            background: CREAM,
            border: `3px solid ${CREAM}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              width={744}
              height={820}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(1.1) contrast(1.05)",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                background: "#cbb88a",
                alignItems: "center",
                justifyContent: "center",
                color: BG_DARK,
                fontSize: 28,
                letterSpacing: 6,
                fontWeight: 800,
              }}
            >
              NO PHOTO
            </div>
          )}

          {/* Position roundel — top-right of photo */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 96,
              background: CREAM,
              border: `4px solid ${BG_DARK}`,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
              color: BG_DARK,
              fontFamily: "serif",
            }}
          >
            {player.position || "—"}
          </div>

          {/* Faux signature ribbon along bottom of photo */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              background: "rgba(244, 236, 210, 0.88)",
              borderTop: `2px solid ${BG_DARK}`,
              fontFamily: "cursive",
              fontStyle: "italic",
              fontSize: 28,
              color: INK,
            }}
          >
            {player.name}
          </div>
        </div>

        {/* Bottom strip — career years */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 28px 18px",
            color: CREAM,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: "serif",
          }}
        >
          {player.years}
        </div>
      </div>
    </div>
  );
}

function firstWords(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return "";
  return parts.slice(0, -1).join(" ");
}

function lastWord(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}
