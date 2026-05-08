import type { Player } from "../../types";

// 1989 Topps: thick outer color frame with inner cream border, team-color
// flag bar across the top (with white "TOPPS" pill), big photo, then a
// chunky team color block at the bottom carrying a slanted name + position.

const FRAME = "#dc4631";    // outer red frame
const FRAME_DARK = "#9b2718";
const CREAM = "#f7f1de";
const INK = "#0f0f0f";
const ACCENT = "#1d3a87";   // royal blue

export function Topps89Front({ player }: { player: Player }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: FRAME,
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
          background: CREAM,
          border: `4px solid ${FRAME_DARK}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top team-color bar with TOPPS pill on the left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: ACCENT,
            color: CREAM,
            padding: "10px 16px",
            borderBottom: `4px solid ${FRAME_DARK}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: CREAM,
              color: ACCENT,
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: 4,
              marginRight: 16,
              border: `2px solid ${FRAME_DARK}`,
            }}
          >
            TOPPS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 4,
              textTransform: "uppercase",
              flex: 1,
            }}
          >
            {player.team || "TEAM"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 800,
            }}
          >
            {player.years}
          </div>
        </div>

        {/* Photo */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#cfc6a8",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              width={744}
              height={760}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                color: ACCENT,
                fontSize: 28,
                letterSpacing: 6,
                fontWeight: 800,
              }}
            >
              NO PHOTO
            </div>
          )}

          {/* Position swatch — sliced into bottom-right of photo */}
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: FRAME,
              color: CREAM,
              padding: "10px 22px 10px 26px",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: "uppercase",
              borderTop: `4px solid ${FRAME_DARK}`,
              borderLeft: `4px solid ${FRAME_DARK}`,
            }}
          >
            {player.position || "—"}
          </div>
        </div>

        {/* Bottom team-color name slab */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: ACCENT,
            color: CREAM,
            padding: "20px 24px",
            borderTop: `4px solid ${FRAME_DARK}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 900,
              fontStyle: "italic",
              lineHeight: 0.95,
              letterSpacing: -1,
              textTransform: "uppercase",
            }}
          >
            {player.name}
          </div>
        </div>
      </div>
    </div>
  );
}
