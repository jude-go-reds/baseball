import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GOLD = "#c9a227";
const BLACK = "#000000";

export default function AppleIcon() {
  const px = 180;
  const cardW = Math.round(px * 0.62);
  const cardH = Math.round(px * 0.8);
  const radius = Math.round(px * 0.08);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BLACK,
        }}
      >
        <div
          style={{
            display: "flex",
            width: cardW,
            height: cardH,
            background: GOLD,
            borderRadius: radius,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
