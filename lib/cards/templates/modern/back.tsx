import { type Player, buildAwardTiles } from "../../types";

const GOLD = "#c9a227";
const DARK_GREEN = "#0b3d2e";
const DEEP = "#062018";
const CREAM = "#f5f5f0";
const INK = "#0b1d17";

export function ModernBack({ player }: { player: Player }) {
  const stats: Array<[string, string | number]> = [
    ["AVG", player.hitting.avg],
    ["OBP", player.hitting.obp],
    ["SLG", player.hitting.slg],
    ["OPS", player.hitting.ops],
    ["HR", player.hitting.hr],
    ["RBI", player.hitting.rbi],
    ["H", player.hitting.h],
    ["R", player.hitting.r],
    ["SB", player.hitting.sb],
  ];
  const awards = buildAwardTiles(player.honors);

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
        color: CREAM,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          border: `4px solid ${GOLD}`,
          borderRadius: "20px",
          background: CREAM,
          color: INK,
          overflow: "hidden",
        }}
      >
        {/* Header strip with name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: DARK_GREEN,
            color: CREAM,
            padding: "20px 28px",
            borderBottom: `4px solid ${GOLD}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
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
              marginTop: 8,
              fontSize: 18,
              color: GOLD,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {player.position}  {String.fromCharCode(0x2022)}  {player.team}  {String.fromCharCode(0x2022)}  {player.years}
          </div>
        </div>

        {/* Career Awards section */}
        {awards.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "24px 28px 8px",
              background: GOLD,
              color: INK,
              borderBottom: `4px solid ${DARK_GREEN}`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 800,
                color: DEEP,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Career Awards
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              {awards.map(({ value, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: awards.length <= 4 ? "25%" : "33.3333%",
                    padding: "8px 8px 16px",
                    boxSizing: "border-box",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 64,
                      fontWeight: 900,
                      color: DEEP,
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      color: DEEP,
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

        {/* Stats body */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              color: DARK_GREEN,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Career Totals
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            {stats.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "33.3333%",
                  padding: "10px 8px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 16,
                    color: "#5a6e64",
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 40,
                    fontWeight: 900,
                    color: INK,
                    marginTop: 2,
                  }}
                >
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <div
          style={{
            display: "flex",
            background: DEEP,
            color: "rgba(245, 245, 240, 0.75)",
            padding: "12px 24px",
            fontSize: 13,
          }}
        >
          baseball-cards.app  {String.fromCharCode(0x2022)}  data: hardcoded demo  {String.fromCharCode(0x2022)}  photo: Wikimedia Commons (public domain)
        </div>
      </div>
    </div>
  );
}
