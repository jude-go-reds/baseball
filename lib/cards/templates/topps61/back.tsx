import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";

const BG = "#cfe6c8";       // 1961 mint back
const PAPER = "#f4efe1";
const FRAME = "#1a1a1a";
const GREEN = "#2f7d4a";
const RED = "#b8352b";
const INK = "#1a1a1a";

export function Topps61Back({ player }: { player: Player }) {
  const sections: Array<{ title: string; tiles: StatTile[] }> = [];
  if (player.hitting) sections.push({ title: "Career Batting", tiles: buildHittingTiles(player.hitting) });
  if (player.pitching) sections.push({ title: "Career Pitching", tiles: buildPitchingTiles(player.pitching) });
  const awards = buildAwardTiles(player.honors);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BG,
        padding: 26,
        boxSizing: "border-box",
        fontFamily: "serif",
        color: INK,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          background: PAPER,
          border: `2px solid ${FRAME}`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: GREEN,
            color: PAPER,
            padding: "16px 22px",
            borderBottom: `2px solid ${FRAME}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              {player.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {[player.position, player.team, player.years].filter(Boolean).join("  •  ")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              background: RED,
              color: PAPER,
              padding: "6px 14px",
              border: `2px solid ${PAPER}`,
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 800,
            }}
          >
            1961
          </div>
        </div>

        {/* Awards row */}
        {awards.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              padding: "12px 22px",
              borderBottom: `1px solid ${FRAME}`,
              background: BG,
              gap: "6px 18px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {awards.map(({ value, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", fontSize: 16 }}>
                <span
                  style={{
                    display: "flex",
                    fontWeight: 900,
                    color: RED,
                    marginRight: 6,
                    fontSize: 20,
                  }}
                >
                  {value}
                </span>
                <span style={{ display: "flex", color: INK, letterSpacing: 1 }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats sections */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: "16px 22px" }}>
          {sections.map((s, i) => (
            <div
              key={s.title}
              style={{ display: "flex", flexDirection: "column", marginTop: i > 0 ? 16 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 900,
                  color: GREEN,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  borderBottom: `2px solid ${FRAME}`,
                  paddingBottom: 4,
                  marginBottom: 8,
                }}
              >
                {s.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {s.tiles.map((t) => (
                  <div
                    key={t.label}
                    style={{
                      display: "flex",
                      width: "33.3333%",
                      padding: "6px 10px",
                      boxSizing: "border-box",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${GREEN}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 13,
                        fontWeight: 800,
                        color: GREEN,
                        letterSpacing: 1,
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 22,
                        fontWeight: 900,
                        color: INK,
                      }}
                    >
                      {t.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            background: GREEN,
            color: PAPER,
            padding: "8px 18px",
            fontSize: 11,
            letterSpacing: 1,
          }}
        >
          data: MLB Stats API + Baseball-Reference  {String.fromCharCode(0x2022)}  photos: MLB / Wikimedia
        </div>
      </div>
    </div>
  );
}
