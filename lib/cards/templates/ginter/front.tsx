import type { Player } from "../../types";

// Allen & Ginter — Victorian tobacco-card aesthetic.
// Cream stock, ornate double border, sepia-washed portrait,
// ribbon banner with the player's name, "World's Champions" tagline.

const PAPER = "#f3e7c4";       // cream stock
const PAPER_HI = "#fff7d8";    // inner highlight cream
const SEPIA = "#5a3a1c";       // ink
const SEPIA_DARK = "#2c1a0c";
const GOLD = "#a8862a";
const RIBBON = "#7a1f1a";      // dusty crimson banner

const ORN = String.fromCharCode(0x2022); // bullet — Satori-safe ornament
const EMDASH = String.fromCharCode(0x2014);

export function GinterFront({ player }: { player: Player }) {
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
        fontFamily: "serif",
      }}
    >
      {/* Outer thin border */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          background: PAPER,
          border: `2px solid ${SEPIA_DARK}`,
          padding: 8,
        }}
      >
        {/* Inner gold border */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            border: `1px solid ${GOLD}`,
            padding: 16,
            background: PAPER_HI,
            position: "relative",
          }}
        >
          {/* Top header — Allen & Ginter's */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 0 6px 0",
              borderBottom: `1px solid ${SEPIA}`,
            }}
          >
            <span style={{ display: "flex", color: GOLD, fontSize: 14, marginRight: 12 }}>
              {ORN}
            </span>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: SEPIA_DARK,
                letterSpacing: 6,
                fontWeight: 700,
                textTransform: "uppercase",
                fontFamily: "serif",
              }}
            >
              Allen {String.fromCharCode(0x0026)} Ginter{String.fromCharCode(0x2019)}s
            </div>
            <span style={{ display: "flex", color: GOLD, fontSize: 14, marginLeft: 12 }}>
              {ORN}
            </span>
          </div>

          {/* Sub-header — World's Champions */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "6px 0 12px 0",
              borderBottom: `1px solid ${GOLD}`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: SEPIA,
                letterSpacing: 4,
                fontStyle: "italic",
                textTransform: "uppercase",
              }}
            >
              World{String.fromCharCode(0x2019)}s Champions  {EMDASH}  Base Ball Series
            </div>
          </div>

          {/* Photo — sepia-washed inside an inset frame */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 540,
                height: 620,
                background: "#d8c79c",
                border: `4px solid ${SEPIA_DARK}`,
                boxShadow: `0 0 0 2px ${PAPER_HI}, 0 0 0 4px ${GOLD}`,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  width={540}
                  height={620}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "sepia(0.7) contrast(1.05) saturate(0.9)",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    color: SEPIA_DARK,
                    fontSize: 24,
                    letterSpacing: 6,
                    fontWeight: 700,
                  }}
                >
                  NO PORTRAIT
                </div>
              )}
            </div>
          </div>

          {/* Ribbon banner — player name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: RIBBON,
              color: PAPER_HI,
              padding: "12px 22px",
              border: `2px solid ${SEPIA_DARK}`,
              boxShadow: `inset 0 0 0 2px ${GOLD}`,
              marginTop: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 38,
                fontWeight: 900,
                letterSpacing: 1,
                fontStyle: "italic",
                fontFamily: "serif",
              }}
            >
              {player.name}
            </div>
          </div>

          {/* Footer line — team / position / years */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px 0 0",
              fontSize: 16,
              color: SEPIA,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            {[player.position, player.team, player.years]
              .filter(Boolean)
              .join("  " + EMDASH + "  ")}
          </div>
        </div>
      </div>
    </div>
  );
}
