import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";

const SEPIA_BG = "#e9d9b3";
const SEPIA_DARK = "#b48a45";
const PAPER = "#f6ecd0";
const INK = "#2b1d10";
const BAND = "#a32420";

export function VintageBack({ player }: { player: Player }) {
  const sections: Array<{ title: string; tiles: StatTile[] }> = [];
  if (player.hitting) sections.push({ title: "Batting", tiles: buildHittingTiles(player.hitting) });
  if (player.pitching) sections.push({ title: "Pitching", tiles: buildPitchingTiles(player.pitching) });
  const awards = buildAwardTiles(player.honors);

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
          color: INK,
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: BAND,
            color: PAPER,
            padding: "16px 24px",
            borderBottom: `3px solid ${SEPIA_DARK}`,
          }}
        >
          <div style={{ display: "flex", fontSize: 36, fontWeight: 900, letterSpacing: -0.5 }}>
            {player.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", marginTop: 6, fontSize: 18, letterSpacing: 1 }}>
            {[player.position, player.team, player.years].filter(Boolean).join("  •  ")}
          </div>
        </div>

        {awards.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              padding: "12px 20px",
              borderBottom: `2px dashed ${SEPIA_DARK}`,
              gap: "6px 20px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {awards.map(({ value, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontStyle: "italic",
                  color: INK,
                }}
              >
                <span style={{ display: "flex", fontWeight: 900, marginRight: 6 }}>
                  {value}
                </span>
                {label}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: "20px 28px" }}>
          {sections.map((s, i) => (
            <div key={s.title} style={{ display: "flex", flexDirection: "column", marginTop: i > 0 ? 18 : 0 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: BAND,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  borderBottom: `2px solid ${SEPIA_DARK}`,
                  paddingBottom: 4,
                  marginBottom: 8,
                }}
              >
                Career {s.title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {s.tiles.map((t) => (
                  <div
                    key={t.label}
                    style={{
                      display: "flex",
                      width: "33.3333%",
                      padding: "6px 8px",
                      boxSizing: "border-box",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      borderBottom: `1px dashed ${SEPIA_DARK}`,
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 14, fontStyle: "italic", color: INK, opacity: 0.7 }}>
                      {t.label}
                    </div>
                    <div style={{ display: "flex", fontSize: 22, fontWeight: 900, color: INK }}>
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
            background: SEPIA_DARK,
            color: PAPER,
            padding: "8px 20px",
            fontSize: 11,
            fontStyle: "italic",
          }}
        >
          data: MLB Stats API + Baseball-Reference {String.fromCharCode(0x2022)} photos: MLB / Wikimedia
        </div>
      </div>
    </div>
  );
}
