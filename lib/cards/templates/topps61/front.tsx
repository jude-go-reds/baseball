import type { Player } from "../../types";

// 1961 Topps: cream-white card, big photo with thin frame, team name in
// pastel banner, position roundel sliced into the bottom corner, player
// name in a clean serif under the photo.

const PAPER = "#f4efe1";
const FRAME = "#1a1a1a";
const BAND_GREEN = "#2f7d4a";
const BAND_DARK = "#1d4d2d";
const RED = "#b8352b";
const INK = "#1a1a1a";

export function Topps61Front({ player }: { player: Player }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        padding: 26,
        boxSizing: "border-box",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          background: PAPER,
          border: `2px solid ${FRAME}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Photo block — fills upper ~70% */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#dcd6c0",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderBottom: `2px solid ${FRAME}`,
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
                filter: "saturate(0.92) contrast(1.02)",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                color: BAND_DARK,
                fontSize: 28,
                letterSpacing: 6,
                fontWeight: 800,
              }}
            >
              NO PHOTO
            </div>
          )}

          {/* Team pennant in top-left corner of photo */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "flex",
              alignItems: "center",
              background: RED,
              color: PAPER,
              padding: "8px 18px",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              border: `2px solid ${PAPER}`,
              boxShadow: `0 0 0 2px ${FRAME}`,
              maxWidth: 360,
              fontFamily: "serif",
            }}
          >
            {player.team || "TEAM"}
          </div>
        </div>

        {/* Name + position band */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: PAPER,
            padding: "18px 26px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 900,
                color: INK,
                lineHeight: 0.95,
                letterSpacing: -1,
                fontFamily: "serif",
              }}
            >
              {player.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 16,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: BAND_DARK,
                fontWeight: 700,
              }}
            >
              {player.years}
            </div>
          </div>

          {/* Position roundel */}
          <div
            style={{
              display: "flex",
              width: 92,
              height: 92,
              borderRadius: 92,
              background: BAND_GREEN,
              color: PAPER,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
              border: `3px solid ${FRAME}`,
              fontFamily: "serif",
              marginLeft: 18,
            }}
          >
            {player.position || "—"}
          </div>
        </div>

        {/* Bottom green band */}
        <div
          style={{
            display: "flex",
            background: BAND_GREEN,
            padding: "10px 26px",
            color: PAPER,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 6,
            textTransform: "uppercase",
            borderTop: `2px solid ${FRAME}`,
            justifyContent: "center",
          }}
        >
          1961 Series
        </div>
      </div>
    </div>
  );
}
