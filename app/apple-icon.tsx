import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GOLD = "#c9a227";
const BLACK = "#000000";
const WHITE = "#ffffff";
const RED = "#c8102e";

export default function AppleIcon() {
  const px = 180;
  const cardW = Math.round(px * 0.62);
  const cardH = Math.round(px * 0.8);
  const radius = Math.round(px * 0.08);
  const ballSize = Math.round(cardW * 0.45);

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
            alignItems: "center",
            justifyContent: "center",
            width: cardW,
            height: cardH,
            background: GOLD,
            borderRadius: radius,
          }}
        >
          <svg
            width={ballSize}
            height={ballSize}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="48" fill={WHITE} />
            <path
              d="M 35 22 Q 18 50 35 78"
              stroke={RED}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 65 22 Q 82 50 65 78"
              stroke={RED}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
