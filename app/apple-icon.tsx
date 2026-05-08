import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GOLD = "#c9a227";
const DEEP = "#062018";
const DARK_GREEN = "#0b3d2e";
const CREAM = "#f5f5f0";

export default function AppleIcon() {
  const px = 180;
  const cardW = Math.round(px * 0.62);
  const cardH = Math.round(px * 0.8);
  const innerBorder = 3;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${DARK_GREEN} 0%, ${DEEP} 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: cardW,
            height: cardH,
            background: CREAM,
            border: `${innerBorder}px solid ${GOLD}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              background: DARK_GREEN,
              borderBottom: `${innerBorder}px solid ${GOLD}`,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
              background: DEEP,
              color: GOLD,
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            BB
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
