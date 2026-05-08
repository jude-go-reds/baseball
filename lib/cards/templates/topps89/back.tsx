import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";
import { primaryTeamLogoUrl } from "@/lib/teams/logos";

// 1989 Upper Deck back: white card stock, navy header band with the
// player name and a faux-holographic UD hex, clean stat blocks below.

const PAPER = "#fafaf7";
const INK = "#0d1721";
const NAVY = "#102a55";
const GREEN = "#1f6f43";
const GOLD = "#d4af37";
const RULE = "#c9c5b6";

export function Topps89Back({ player }: { player: Player }) {
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
        background: PAPER,
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
          border: `2px solid ${INK}`,
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: NAVY,
            color: PAPER,
            padding: "14px 22px",
            borderBottom: `4px solid ${GOLD}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                width={56}
                height={56}
                style={{ marginRight: 14, objectFit: "contain" }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: -0.5,
                  textTransform: "uppercase",
                }}
              >
                {player.name}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 6,
                  fontSize: 13,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: GOLD,
                  fontWeight: 700,
                }}
              >
                {[player.position, player.team, player.years].filter(Boolean).join("  •  ")}
              </div>
            </div>
          </div>
          <HoloHex />
        </div>

        {/* Awards strip */}
        {awards.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "14px 22px",
              borderBottom: `1px solid ${RULE}`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 13,
                fontWeight: 900,
                color: NAVY,
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
                      color: GREEN,
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
                  background: NAVY,
                  color: PAPER,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  borderBottom: `2px solid ${GOLD}`,
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
                        color: NAVY,
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
            background: NAVY,
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

// Faux-holographic UD hex — gold/silver gradient with UD lettering.
function HoloHex() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 70,
        height: 70,
        background: `linear-gradient(135deg, #f1d27a 0%, #cfcfcf 50%, #f1d27a 100%)`,
        border: `2px solid #0d1721`,
        color: "#0d1721",
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: 3,
      }}
    >
      UD
    </div>
  );
}
