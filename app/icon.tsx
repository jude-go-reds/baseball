import { ImageResponse } from "next/og";

export function generateImageMetadata() {
  return [
    { id: "192", contentType: "image/png", size: { width: 192, height: 192 } },
    { id: "512", contentType: "image/png", size: { width: 512, height: 512 } },
  ];
}

const GOLD = "#c9a227";
const DEEP = "#062018";
const DARK_GREEN = "#0b3d2e";
const CREAM = "#f5f5f0";

export default async function Icon({ id }: { id: Promise<string> }) {
  const iconId = await id;
  const px = iconId === "512" ? 512 : 192;
  const cardW = Math.round(px * 0.6);
  const cardH = Math.round(px * 0.78);
  const radius = Math.round(px * 0.08);
  const innerBorder = Math.max(2, Math.round(px * 0.018));

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
            borderRadius: radius,
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
              padding: Math.round(px * 0.04),
              background: DEEP,
              color: GOLD,
              fontSize: Math.round(px * 0.16),
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            BB
          </div>
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}
