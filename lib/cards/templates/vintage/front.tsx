import type { Player } from "../../types";

const SEPIA_BG = "#e9d9b3";
const SEPIA_DARK = "#b48a45";
const PAPER = "#f6ecd0";
const BAND = "#a32420"; // muted Topps red

export function VintageFront({ player }: { player: Player }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: SEPIA_BG,
        padding: "30px",
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
          border: `3px solid ${SEPIA_DARK}`,
          borderRadius: 4,
          overflow: "hidden",
          padding: 0,
          position: "relative",
        }}
      >
        {/* Photo block */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#d8c79c",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `3px solid ${SEPIA_DARK}`,
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
                filter: "sepia(0.4) contrast(1.05)",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                color: SEPIA_DARK,
                fontSize: 28,
                letterSpacing: 4,
              }}
            >
              NO PHOTO
            </div>
          )}
        </div>

        {/* Position roundel (top-left, sits on top of the photo) */}
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            display: "flex",
            width: 84,
            height: 84,
            borderRadius: 84,
            background: BAND,
            color: PAPER,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 900,
            fontFamily: "serif",
            border: `4px solid ${PAPER}`,
            boxShadow: `0 0 0 2px ${SEPIA_DARK}`,
          }}
        >
          {player.position || "—"}
        </div>

        {/* Bottom name banner — Topps-style angled red ribbon */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: BAND,
            color: PAPER,
            padding: "18px 28px",
            borderTop: `3px solid ${SEPIA_DARK}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: -0.5,
              fontFamily: "serif",
              lineHeight: 1,
            }}
          >
            {player.name.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 22,
              fontFamily: "serif",
              letterSpacing: 1,
            }}
          >
            {player.team}  {String.fromCharCode(0x2022)}  {player.years}
          </div>
        </div>
      </div>
    </div>
  );
}
