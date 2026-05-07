"use client";

import { useState } from "react";

type Props = {
  playerId: string;
  playerName: string;
};

export function FlipCard({ playerId, playerName }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      style={{
        perspective: "1500px",
        width: "min(90vw, 400px)",
        aspectRatio: "800 / 1120",
      }}
    >
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show card front" : "Show card back"}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
          background: "transparent",
          border: 0,
          padding: 0,
        }}
      >
        <Face src={`/api/card/${playerId}?side=front`} alt={`${playerName} front`} />
        <Face
          src={`/api/card/${playerId}?side=back`}
          alt={`${playerName} back`}
          back
        />
      </button>
    </div>
  );
}

function Face({ src, alt, back = false }: { src: string; alt: string; back?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow:
          "0 30px 60px -20px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.4)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={400}
        height={560}
        style={{ width: "100%", height: "100%", display: "block" }}
        draggable={false}
      />
    </div>
  );
}
