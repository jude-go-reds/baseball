export type HitterCareer = {
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  hr: number;
  rbi: number;
  h: number;
  r: number;
  sb: number;
};

export type Honors = {
  worldSeries: number;
  mvp: number;
  allStar: number;
  goldGlove: number;
  silverSlugger: number;
  cyYoung: number;
  hofYear: number | null;
};

export type Player = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
  photoUrl: string | null;
  honors: Honors;
  hitting: HitterCareer;
};

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 1120;

const GOLD = "#c9a227";
const DARK_GREEN = "#0b3d2e";
const DEEP = "#062018";
const CREAM = "#f5f5f0";
const INK = "#0b1d17";

function buildHonorsStrip(h: Honors): string[] {
  const items: string[] = [];
  if (h.hofYear) items.push(`HoF ${h.hofYear}`);
  if (h.worldSeries) items.push(`${h.worldSeries}× WS`);
  if (h.mvp) items.push(`${h.mvp}× MVP`);
  if (h.cyYoung) items.push(`${h.cyYoung}× CY`);
  if (h.allStar) items.push(`${h.allStar}× AS`);
  if (h.goldGlove) items.push(`${h.goldGlove}× GG`);
  if (h.silverSlugger) items.push(`${h.silverSlugger}× SS`);
  return items;
}

export function ModernCard({ player }: { player: Player }) {
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
  const honors = buildHonorsStrip(player.honors);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${DARK_GREEN} 0%, ${DEEP} 100%)`,
        color: CREAM,
        fontFamily: "sans-serif",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      {/* Header: photo + name/team/position/years */}
      <div
        style={{
          display: "flex",
          padding: "20px",
          background: "rgba(0, 0, 0, 0.35)",
          borderRadius: "16px",
          border: `2px solid ${GOLD}`,
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 180,
            height: 240,
            borderRadius: "12px",
            overflow: "hidden",
            background: "#222",
            border: `2px solid ${GOLD}`,
            flexShrink: 0,
          }}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              width={180}
              height={240}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                color: GOLD,
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              NO PHOTO
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800, lineHeight: 1.05 }}>
            {player.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 22,
              color: GOLD,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {player.team}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              fontSize: 20,
              color: CREAM,
              opacity: 0.85,
            }}
          >
            {player.position}  {String.fromCharCode(0x2022)}  {player.years}
          </div>
        </div>
      </div>

      {/* Honors strip */}
      {honors.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 20,
            padding: "16px 20px",
            background: GOLD,
            color: INK,
            borderRadius: "12px",
            gap: "8px 20px",
          }}
        >
          {honors.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Career totals */}
      <div
        style={{
          display: "flex",
          flex: 1,
          marginTop: 20,
          background: CREAM,
          color: INK,
          borderRadius: "16px",
          padding: "28px",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            color: DARK_GREEN,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Career Totals
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          {stats.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "33.3333%",
                padding: "14px 8px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  color: "#5a6e64",
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 42,
                  fontWeight: 800,
                  color: INK,
                  marginTop: 4,
                }}
              >
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 16,
          fontSize: 14,
          color: "rgba(245, 245, 240, 0.7)",
        }}
      >
        baseball-cards.app  {String.fromCharCode(0x2022)}  data: hardcoded demo  {String.fromCharCode(0x2022)}  photo: Wikimedia Commons (public domain)
      </div>
    </div>
  );
}
