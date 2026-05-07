import type { Player } from "../../types";

const BG = "#f8f8f6";
const FG = "#0a0a0a";
const ACCENT = "#0a0a0a";
const MUTED = "#9a9a96";

export function MinimalistFront({ player }: { player: Player }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BG,
        padding: 60,
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        color: FG,
      }}
    >
      {/* Top: a row with position & years on either end */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        <div style={{ display: "flex" }}>{player.position || "—"}</div>
        <div style={{ display: "flex" }}>{player.years}</div>
      </div>

      {/* Photo, square, framed by negative space */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 480,
            height: 480,
            background: "#e6e6e1",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              width={480}
              height={480}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1)" }}
            />
          ) : (
            <div style={{ display: "flex", color: MUTED, fontSize: 14, letterSpacing: 4 }}>
              NO PHOTO
            </div>
          )}
        </div>
      </div>

      {/* Bottom: name in big monospace-feel sans + team underline */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          {player.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: ACCENT,
            borderTop: `2px solid ${FG}`,
            paddingTop: 10,
          }}
        >
          {player.team}
        </div>
      </div>
    </div>
  );
}
