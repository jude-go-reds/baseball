import {
  type Player,
  type StatTile,
  buildAwardTiles,
  buildHittingTiles,
  buildPitchingTiles,
} from "../../types";
import { primaryTeamLogoUrl } from "@/lib/teams/logos";

const GOLD = "#c9a227";
const DARK_GREEN = "#0b3d2e";
const DEEP = "#062018";
const CREAM = "#f5f5f0";
const INK = "#0b1d17";

export function ModernBack({ player }: { player: Player }) {
  const sections: Array<{ title: string; tiles: StatTile[] }> = [];
  if (player.hitting) {
    sections.push({ title: "Career Batting", tiles: buildHittingTiles(player.hitting) });
  }
  if (player.pitching) {
    sections.push({ title: "Career Pitching", tiles: buildPitchingTiles(player.pitching) });
  }
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
        <Header player={player} />

        {awards.length > 0 && <AwardsSection awards={awards} />}

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            padding: "24px 28px",
          }}
        >
          {sections.map((s, i) => (
            <StatSection key={s.title} title={s.title} tiles={s.tiles} compact={i > 0} />
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
}

function Header({ player }: { player: Player }) {
  const logo = primaryTeamLogoUrl(player.team);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: DARK_GREEN,
        color: CREAM,
        padding: "20px 28px",
        borderBottom: `4px solid ${GOLD}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
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
          {[player.position, player.team, player.years].filter(Boolean).join("  •  ")}
        </div>
      </div>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={72} height={72} style={{ marginLeft: 16, objectFit: "contain" }} />
      )}
    </div>
  );
}

function AwardsSection({ awards }: { awards: ReturnType<typeof buildAwardTiles> }) {
  return (
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
  );
}

function StatSection({
  title,
  tiles,
  compact,
}: {
  title: string;
  tiles: StatTile[];
  compact: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: compact ? 16 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 20,
          fontWeight: 800,
          color: DARK_GREEN,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: 10,
        }}
      >
        {tiles.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              width: "33.3333%",
              padding: "8px 8px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
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
                fontSize: 36,
                fontWeight: 900,
                color: INK,
                marginTop: 2,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        display: "flex",
        background: DEEP,
        color: "rgba(245, 245, 240, 0.75)",
        padding: "10px 20px",
        fontSize: 11,
      }}
    >
      data: MLB Stats API + Baseball-Reference (WAR / OPS+ / ERA+)  {String.fromCharCode(0x2022)}  photos: MLB / Wikimedia
    </div>
  );
}
