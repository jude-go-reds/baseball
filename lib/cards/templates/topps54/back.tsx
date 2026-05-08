import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";
import { primaryTeamLogoUrl } from "@/lib/teams/logos";

const BG = "#f1d77a";       // 1954 mustard back panel
const PANEL = "#fff7d8";
const INK = "#1a0e0a";
const ACCENT = "#9a2f25";
const NAVY = "#1f2c5c";

export function Topps54Back({ player }: { player: Player }) {
  const sections: Array<{ title: string; tiles: StatTile[] }> = [];
  if (player.hitting) sections.push({ title: "Career Batting", tiles: buildHittingTiles(player.hitting) });
  if (player.pitching) sections.push({ title: "Career Pitching", tiles: buildPitchingTiles(player.pitching) });
  const awards = buildAwardTiles(player.honors);
  const logo = primaryTeamLogoUrl(player.team);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BG,
        padding: 22,
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
          background: PANEL,
          border: `4px solid ${ACCENT}`,
          overflow: "hidden",
        }}
      >
        {/* Header — name banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: ACCENT,
            color: PANEL,
            padding: "16px 24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                fontSize: 38,
                fontWeight: 900,
                letterSpacing: -0.5,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {player.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 16,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {[player.position, player.team, player.years].filter(Boolean).join("  •  ")}
            </div>
          </div>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={64} height={64} style={{ marginLeft: 16, objectFit: "contain" }} />
          )}
        </div>

        {/* "Inside Baseball" mock cartoon strip + awards */}
        {awards.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "14px 22px",
              borderBottom: `2px solid ${ACCENT}`,
              background: BG,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                fontWeight: 800,
                color: NAVY,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Inside Baseball  —  Career Honors
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {awards.map(({ value, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    width: awards.length <= 4 ? "25%" : "33.3333%",
                    padding: "4px 6px",
                    boxSizing: "border-box",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 26,
                      fontWeight: 900,
                      color: ACCENT,
                      marginRight: 8,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 12,
                      fontWeight: 700,
                      color: INK,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat sections */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: "16px 24px" }}>
          {sections.map((s, i) => (
            <div
              key={s.title}
              style={{ display: "flex", flexDirection: "column", marginTop: i > 0 ? 14 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 900,
                  color: NAVY,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  borderBottom: `2px solid ${ACCENT}`,
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
                      borderBottom: `1px dashed ${ACCENT}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 13,
                        fontWeight: 700,
                        color: NAVY,
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
            background: NAVY,
            color: PANEL,
            padding: "8px 18px",
            fontSize: 11,
            fontStyle: "italic",
            letterSpacing: 1,
          }}
        >
          data: MLB Stats API + Baseball-Reference  {String.fromCharCode(0x2022)}  photos: MLB / Wikimedia
        </div>
      </div>
    </div>
  );
}
