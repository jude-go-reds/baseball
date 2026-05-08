import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";

const PAPER = "#f3e7c4";
const PAPER_HI = "#fff7d8";
const SEPIA = "#5a3a1c";
const SEPIA_DARK = "#2c1a0c";
const GOLD = "#a8862a";
const RIBBON = "#7a1f1a";

const ORN = String.fromCharCode(0x2022); // bullet — Satori-safe ornament
const EMDASH = String.fromCharCode(0x2014);

export function GinterBack({ player }: { player: Player }) {
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
        background: PAPER,
        padding: 18,
        boxSizing: "border-box",
        fontFamily: "serif",
        color: SEPIA_DARK,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          border: `2px solid ${SEPIA_DARK}`,
          padding: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            background: PAPER_HI,
            border: `1px solid ${GOLD}`,
            padding: 18,
          }}
        >
          {/* Title block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderBottom: `1px solid ${SEPIA}`,
              paddingBottom: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: SEPIA,
                letterSpacing: 6,
                fontStyle: "italic",
              }}
            >
              {ORN}  Career Record  {ORN}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 38,
                fontWeight: 900,
                color: SEPIA_DARK,
                marginTop: 4,
                fontStyle: "italic",
                letterSpacing: 0.5,
              }}
            >
              {player.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 4,
                fontSize: 14,
                color: SEPIA,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {[player.position, player.team, player.years]
                .filter(Boolean)
                .join("  " + EMDASH + "  ")}
            </div>
          </div>

          {/* Honors banner */}
          {awards.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 14,
                padding: "12px 14px",
                background: RIBBON,
                color: PAPER_HI,
                border: `2px solid ${SEPIA_DARK}`,
                boxShadow: `inset 0 0 0 2px ${GOLD}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 12,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  marginBottom: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ORN}  Honors of the Profession  {ORN}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "4px 14px",
                }}
              >
                {awards.map(({ value, label }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      fontSize: 16,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        fontWeight: 900,
                        color: PAPER_HI,
                        marginRight: 6,
                        fontSize: 18,
                      }}
                    >
                      {value}
                    </span>
                    <span style={{ display: "flex", letterSpacing: 1 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stat sections */}
          <div style={{ display: "flex", flex: 1, flexDirection: "column", marginTop: 16 }}>
            {sections.map((s, i) => (
              <div
                key={s.title}
                style={{ display: "flex", flexDirection: "column", marginTop: i > 0 ? 14 : 0 }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    color: SEPIA,
                    letterSpacing: 5,
                    textTransform: "uppercase",
                    fontStyle: "italic",
                    borderBottom: `1px solid ${GOLD}`,
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
                        padding: "5px 10px",
                        boxSizing: "border-box",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        borderBottom: `1px dashed ${SEPIA}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          fontSize: 13,
                          color: SEPIA,
                          fontStyle: "italic",
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
                          color: SEPIA_DARK,
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
              alignItems: "center",
              justifyContent: "center",
              marginTop: 12,
              fontSize: 11,
              color: SEPIA,
              letterSpacing: 2,
              fontStyle: "italic",
            }}
          >
            data: MLB Stats API {EMDASH} Baseball-Reference  {String.fromCharCode(0x2022)}  photos: MLB / Wikimedia
          </div>
        </div>
      </div>
    </div>
  );
}
