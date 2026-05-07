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

export type Player = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
  hitting: HitterCareer;
};

export const CARD_WIDTH = 800;
export const CARD_HEIGHT = 1120;

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

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0b3d2e 0%, #062018 100%)",
        color: "#f5f5f0",
        fontFamily: "sans-serif",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px 28px",
          background: "rgba(0, 0, 0, 0.35)",
          borderRadius: "16px",
          border: "2px solid #c9a227",
        }}
      >
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>
          {player.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 26,
            color: "#c9a227",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          {player.team}  {String.fromCharCode(0x2022)}  {player.position}  {String.fromCharCode(0x2022)}  {player.years}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          marginTop: 32,
          background: "#f5f5f0",
          color: "#0b1d17",
          borderRadius: "16px",
          padding: "32px",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            color: "#0b3d2e",
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
            marginTop: 24,
          }}
        >
          {stats.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "33.3333%",
                padding: "16px 8px",
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
                  fontSize: 44,
                  fontWeight: 800,
                  color: "#0b1d17",
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
          marginTop: 24,
          fontSize: 16,
          color: "rgba(245, 245, 240, 0.7)",
        }}
      >
        baseball-cards.app  {String.fromCharCode(0x2022)}  data: hardcoded demo
      </div>
    </div>
  );
}
