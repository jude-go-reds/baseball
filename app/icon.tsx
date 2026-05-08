import { ImageResponse } from "next/og";

export function generateImageMetadata() {
  return [
    { id: "192", contentType: "image/png", size: { width: 192, height: 192 } },
    { id: "512", contentType: "image/png", size: { width: 512, height: 512 } },
  ];
}

const GOLD = "#c9a227";
const BLACK = "#000000";

export default async function Icon({ id }: { id: Promise<string> }) {
  const iconId = await id;
  const px = iconId === "512" ? 512 : 192;
  const cardW = Math.round(px * 0.6);
  const cardH = Math.round(px * 0.78);
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
    { width: px, height: px },
  );
}
