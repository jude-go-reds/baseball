"use client";

import Link from "next/link";
import { type Lineup } from "@/lib/lineups";
import { type Slot, SLOT_LABEL } from "@/lib/lineups/positions";
import type { PlayerIndexEntry } from "@/lib/hooks/usePlayerIndex";
import { mlbPhotoUrl } from "@/lib/photos/mlb";

// Field-position percentages. Origin is top-left of the green container.
// The view is from behind home plate looking out — home is at the bottom.
const FIELD_POS: Record<Exclude<Slot, "RP" | "DH">, { left: number; top: number }> = {
  CF: { left: 50, top: 10 },
  LF: { left: 18, top: 22 },
  RF: { left: 82, top: 22 },
  SS: { left: 38, top: 46 },
  "2B": { left: 62, top: 42 },
  "3B": { left: 30, top: 60 },
  P: { left: 50, top: 60 },
  "1B": { left: 70, top: 60 },
  C: { left: 50, top: 95 },
};

const FIELD_SLOTS: Array<Exclude<Slot, "RP" | "DH">> = [
  "CF",
  "LF",
  "RF",
  "SS",
  "2B",
  "3B",
  "P",
  "1B",
  "C",
];
const BENCH_SLOTS: Array<Extract<Slot, "RP" | "DH">> = ["RP", "DH"];

type Props = {
  lineup: Lineup;
  byId: Map<string, PlayerIndexEntry> | null;
  onPick?: (slot: Slot) => void;
  onClear?: (slot: Slot) => Promise<void> | void;
};

export function Field({ lineup, byId, onPick, onClear }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* The field */}
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-md"
        style={{ aspectRatio: "5 / 4" }}
      >
        <FieldBackground />

        {/* Player slot buttons */}
        {FIELD_SLOTS.map((slot) => {
          const playerId = lineup.slots[slot];
          const entry = playerId && byId ? byId.get(playerId) ?? null : null;
          const pos = FIELD_POS[slot];
          return (
            <SlotButton
              key={slot}
              slot={slot}
              left={pos.left}
              top={pos.top}
              playerId={playerId ?? null}
              entry={entry}
              onPick={onPick}
              onClear={onClear}
            />
          );
        })}
      </div>

      {/* Bench: RP + DH below the field */}
      <div className="grid grid-cols-2 gap-3">
        {BENCH_SLOTS.map((slot) => {
          const playerId = lineup.slots[slot];
          const entry = playerId && byId ? byId.get(playerId) ?? null : null;
          return (
            <BenchSlot
              key={slot}
              slot={slot}
              playerId={playerId ?? null}
              entry={entry}
              onPick={onPick}
              onClear={onClear}
            />
          );
        })}
      </div>
    </div>
  );
}

// Stylized top-down baseball field. viewBox is 1000x800 (5:4) to match
// the parent container's aspect ratio. Geometry:
//   Home plate:    (500, 700)
//   1B / 2B / 3B:  (670, 530) / (500, 360) / (330, 530)
//   Pitcher mound: (500, 540), radius 38
//   Foul lines run from home at 45° to (76, 276) / (924, 276)
//   Infield arc:   r=362 centered at home plate
function FieldBackground() {
  return (
    <svg
      viewBox="0 0 1000 800"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        {/* Diamond mowing pattern — perpendicular stripes at ±45° create
            the classic MLB outfield checkerboard (see Great American Ball Park). */}
        <pattern
          id="lineup-mow-diamond"
          patternUnits="userSpaceOnUse"
          width="110"
          height="110"
          patternTransform="rotate(45)"
        >
          <rect width="110" height="110" fill="#1f8a3a" />
          <rect width="55" height="55" fill="#17712f" />
          <rect x="55" y="55" width="55" height="55" fill="#17712f" />
        </pattern>
        {/* Finer mowing for the infield grass diamond. */}
        <pattern
          id="lineup-mow-infield"
          patternUnits="userSpaceOnUse"
          width="56"
          height="56"
          patternTransform="rotate(45)"
        >
          <rect width="56" height="56" fill="#1f8a3a" />
          <rect width="28" height="28" fill="#1a7c33" />
          <rect x="28" y="28" width="28" height="28" fill="#1a7c33" />
        </pattern>
      </defs>

      {/* Base: flat muted green for foul territory and beyond-the-wall */}
      <rect width="1000" height="800" fill="#19612c" />

      {/* Fair territory — bounded by the foul lines and the wall arc.
          Diamond mowing pattern only appears inside this shape. */}
      <path
        d="M 500 700 L 76 276 Q 500 -106 924 276 Z"
        fill="url(#lineup-mow-diamond)"
      />

      {/* Warning track — reddish-brown band along the back wall */}
      <path
        d="M 30 320 Q 500 -150 970 320 L 970 270 Q 500 -210 30 270 Z"
        fill="#a06a3a"
      />
      {/* Outfield wall — dark green with yellow cap */}
      <path
        d="M 30 270 Q 500 -210 970 270 L 970 258 Q 500 -222 30 258 Z"
        fill="#0a3a1a"
      />
      <path
        d="M 30 258 Q 500 -222 970 258"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="3"
      />

      {/* Skinned infield — reddish-brown dirt fan from home to infield arc */}
      <path
        d="M 500 700 L 244 444 A 362 362 0 0 1 756 444 L 500 700 Z"
        fill="#b27039"
      />

      {/* Infield grass diamond with subtle mowing */}
      <polygon points="500,660 640,520 500,380 360,520" fill="url(#lineup-mow-infield)" />

      {/* Foul lines */}
      <line x1="500" y1="700" x2="76" y2="276" stroke="#fbfbf6" strokeWidth="3" />
      <line x1="500" y1="700" x2="924" y2="276" stroke="#fbfbf6" strokeWidth="3" />

      {/* Bases (rotated white squares) */}
      <g fill="#fbfbf6" stroke="#7a4a25" strokeWidth="1.5">
        <rect x="-10" y="-10" width="20" height="20" transform="translate(670 530) rotate(45)" />
        <rect x="-10" y="-10" width="20" height="20" transform="translate(500 360) rotate(45)" />
        <rect x="-10" y="-10" width="20" height="20" transform="translate(330 530) rotate(45)" />
      </g>

      {/* Pitcher's mound + rubber */}
      <circle cx="500" cy="540" r="38" fill="#b27039" />
      <rect x="488" y="538" width="24" height="5" fill="#fbfbf6" />

      {/* Batter's boxes flanking home plate */}
      <g fill="none" stroke="#fbfbf6" strokeWidth="1.5" opacity="0.85">
        <rect x="466" y="682" width="14" height="32" />
        <rect x="520" y="682" width="14" height="32" />
      </g>

      {/* Home plate pentagon */}
      <polygon
        points="486,690 514,690 514,705 500,720 486,705"
        fill="#fbfbf6"
        stroke="#7a4a25"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SlotButton({
  slot,
  left,
  top,
  playerId,
  entry,
  onPick,
  onClear,
}: {
  slot: Slot;
  left: number;
  top: number;
  playerId: string | null;
  entry: PlayerIndexEntry | null;
  onPick?: (slot: Slot) => void;
  onClear?: (slot: Slot) => Promise<void> | void;
}) {
  const editable = Boolean(onPick);
  const lastName = entry ? entry.name.split(" ").slice(-1)[0] : null;

  const inner = (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white text-[10px] font-bold text-gray-700 shadow-md sm:h-14 sm:w-14">
        {playerId && entry ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mlbPhotoUrl(playerId)}
            alt={entry.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{slot}</span>
        )}
        {editable && playerId && (
          <button
            type="button"
            aria-label={`Remove ${entry?.name ?? "player"} from ${slot}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void onClear?.(slot);
            }}
            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs text-white hover:bg-rose-700"
          >
            ×
          </button>
        )}
      </div>
      <div className="rounded bg-black/60 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white whitespace-nowrap">
        {lastName ?? slot}
      </div>
    </div>
  );

  const wrapperStyle = {
    position: "absolute" as const,
    left: `${left}%`,
    top: `${top}%`,
    transform: "translate(-50%, -50%)",
  };

  if (editable) {
    return (
      <button
        type="button"
        onClick={() => onPick?.(slot)}
        className="cursor-pointer focus:outline-none"
        style={wrapperStyle}
        title={`${SLOT_LABEL[slot]}${entry ? ` — ${entry.name}` : ""}`}
      >
        {inner}
      </button>
    );
  }

  if (playerId) {
    return (
      <Link
        href={`/card/${playerId}`}
        style={wrapperStyle}
        className="focus:outline-none"
        title={entry ? `${SLOT_LABEL[slot]} — ${entry.name}` : SLOT_LABEL[slot]}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div style={wrapperStyle} title={SLOT_LABEL[slot]}>
      {inner}
    </div>
  );
}

function BenchSlot({
  slot,
  playerId,
  entry,
  onPick,
  onClear,
}: {
  slot: Slot;
  playerId: string | null;
  entry: PlayerIndexEntry | null;
  onPick?: (slot: Slot) => void;
  onClear?: (slot: Slot) => Promise<void> | void;
}) {
  const editable = Boolean(onPick);

  const inner = (
    <div className="flex flex-1 items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-gray-300 bg-gray-50 text-xs font-bold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        {playerId && entry ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mlbPhotoUrl(playerId)}
            alt={entry.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{slot}</span>
        )}
      </div>
      <div className="flex flex-col text-left">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {SLOT_LABEL[slot]}
        </div>
        <div className="text-sm font-medium">
          {entry ? entry.name : <span className="text-gray-400">empty</span>}
        </div>
      </div>
      {editable && playerId && (
        <button
          type="button"
          aria-label={`Remove ${entry?.name ?? "player"} from ${slot}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void onClear?.(slot);
          }}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-800"
        >
          ×
        </button>
      )}
    </div>
  );

  const className =
    "flex min-h-[68px] items-center gap-3 rounded-md border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950";

  if (editable) {
    return (
      <button
        type="button"
        onClick={() => onPick?.(slot)}
        className={`${className} text-left hover:bg-gray-50 dark:hover:bg-gray-900`}
      >
        {inner}
      </button>
    );
  }

  if (playerId) {
    return (
      <Link href={`/card/${playerId}`} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
