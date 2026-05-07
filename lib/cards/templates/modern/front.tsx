import type { Player } from "../../types";

const GOLD = "#c9a227";
const DARK_GREEN = "#0b3d2e";
const DEEP = "#062018";
const CREAM = "#f5f5f0";

export function ModernFront({ player }: { player: Player }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${DARK_GREEN} 0%, ${DEEP} 100%)`,
        padding: "28px",
        boxSizing: "border-box",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          border: `4px solid ${GOLD}`,
          borderRadius: "20px",
          overflow: "hidden",
          background: "#1a1a1a",
        }}
      >
        {/* Top ribbon: position + years */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: GOLD,
            padding: "14px 24px",
            color: DEEP,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>{player.position}</div>
          <div style={{ display: "flex" }}>{player.years}</div>
        </div>

        {/* Photo fills the body */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#2a2a2a",
            alignItems: "center",
            justifyContent: "center",
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
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                color: GOLD,
                fontSize: 28,
                letterSpacing: 4,
              }}
            >
              NO PHOTO
            </div>
          )}
        </div>

        {/* Bottom name banner */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: DEEP,
            borderTop: `4px solid ${GOLD}`,
            padding: "20px 24px",
            color: CREAM,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            {player.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              fontSize: 22,
              color: GOLD,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {player.team}
          </div>
        </div>
      </div>
    </div>
  );
}
