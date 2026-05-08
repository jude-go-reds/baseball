import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";

const BG = "#f1d2c5";        // 1989 dusty pink back
const PAPER = "#fbf1df";
const FRAME_DARK = "#9b2718";
const RED = "#dc4631";
const ACCENT = "#1d3a87";
const INK = "#0f0f0f";

export function Topps89Back({ player }: { player: Player }) {
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
        padding: 18,
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        color: INK,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          background: PAPER,
          border: `4px solid ${FRAME_DARK}`,
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: ACCENT,
            color: PAPER,
            padding: "14px 22px",
            borderBottom: `4px solid ${FRAME_DARK}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 900,
                fontStyle: "italic",
                lineHeight: 1,
                textTransform: "uppercase",
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
                fontWeight: 700,
              }}
            >
              {[player.position, player.team, player.years].filter(Boolean).join("  •  ")}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: RED,
              color: PAPER,
              padding: "6px 14px",
              border: `2px solid ${PAPER}`,
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 900,
            }}
          >
            #89
          </div>
        </div>

        {/* Awards */}
        {awards.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "14px 22px",
              background: BG,
              borderBottom: `2px solid ${FRAME_DARK}`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                fontWeight: 900,
                color: ACCENT,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Career Honors
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {awards.map(({ value, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: awards.length <= 4 ? "25%" : "33.3333%",
                    padding: "4px 8px",
                    boxSizing: "border-box",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 38,
                      fontWeight: 900,
                      color: RED,
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      color: INK,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats sections */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: "16px 22px" }}>
          {sections.map((s, i) => (
            <div
              key={s.title}
              style={{ display: "flex", flexDirection: "column", marginTop: i > 0 ? 14 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: ACCENT,
                  color: PAPER,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                {s.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", marginTop: 6 }}>
                {s.tiles.map((t) => (
                  <div
                    key={t.label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "33.3333%",
                      padding: "6px 10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 12,
                        fontWeight: 800,
                        color: ACCENT,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 26,
                        fontWeight: 900,
                        color: INK,
                        marginTop: 2,
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
            background: RED,
            color: PAPER,
            padding: "8px 18px",
            fontSize: 11,
            letterSpacing: 1,
            fontWeight: 700,
          }}
        >
          data: MLB Stats API + Baseball-Reference  {String.fromCharCode(0x2022)}  photos: MLB / Wikimedia
        </div>
      </div>
    </div>
  );
}
