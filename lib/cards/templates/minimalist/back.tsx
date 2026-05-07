import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";

const BG = "#f8f8f6";
const FG = "#0a0a0a";
const MUTED = "#9a9a96";

// Visual rhythm: each row is a label and a value. Stat rows scale the value
// font by the digit length to keep big numbers from dominating.
function valueSize(value: string): number {
  const len = value.replace(/[^\dA-Za-z]/g, "").length;
  if (len <= 3) return 56;
  if (len <= 4) return 48;
  return 40;
}

function StatRow({ tile }: { tile: StatTile }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "10px 0",
        borderTop: `1px solid #e6e6e1`,
      }}
    >
      <div style={{ display: "flex", fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: MUTED }}>
        {tile.label}
      </div>
      <div style={{ display: "flex", fontSize: valueSize(tile.value), fontWeight: 900, lineHeight: 1 }}>
        {tile.value}
      </div>
    </div>
  );
}

export function MinimalistBack({ player }: { player: Player }) {
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
        background: BG,
        padding: 60,
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        color: FG,
      }}
    >
      {/* Header: name + position•years */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 48,
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
            marginTop: 8,
            fontSize: 13,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {[player.position, player.team, player.years].filter(Boolean).join("  ·  ")}
        </div>
      </div>

      {/* Awards row: count + label inline, separated by big bullets */}
      {awards.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 24,
            gap: "0 28px",
            paddingTop: 16,
            borderTop: `2px solid ${FG}`,
          }}
        >
          {awards.map(({ value, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 900, marginRight: 8 }}>{value}</div>
              <div style={{ display: "flex", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: MUTED }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats: two-column grid; each section gets its own column when both present */}
      <div style={{ display: "flex", flex: 1, marginTop: 24, gap: 32 }}>
        {sections.map((s) => (
          <div key={s.title} style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: FG,
                fontWeight: 700,
              }}
            >
              {s.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
              {s.tiles.map((t) => (
                <StatRow key={t.label} tile={t} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 16,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        MLB Stats API · Baseball-Reference · MLB / Wikimedia
      </div>
    </div>
  );
}
