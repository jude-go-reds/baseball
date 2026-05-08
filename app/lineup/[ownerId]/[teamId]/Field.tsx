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
  "3B": { left: 22, top: 58 },
  P: { left: 50, top: 60 },
  "1B": { left: 78, top: 64 },
  C: { left: 50, top: 90 },
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
        {/* Outfield grass */}
        <div className="absolute inset-0 bg-green-700" />
        {/* Warning track ring */}
        <div className="absolute inset-[3%] rounded-[40%/30%] border-[8px] border-amber-800/60" />
        {/* Outfield grass inside the warning track */}
        <div className="absolute inset-[4%] rounded-[40%/30%] bg-green-600" />
        {/* Infield dirt — square rotated 45° */}
        <div
          className="absolute bg-amber-700"
          style={{
            left: "50%",
            top: "65%",
            width: "46%",
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
        />
        {/* Infield grass — inner diamond */}
        <div
          className="absolute bg-green-600"
          style={{
            left: "50%",
            top: "65%",
            width: "30%",
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
        />
        {/* Pitcher's mound */}
        <div
          className="absolute rounded-full bg-amber-700"
          style={{
            left: "50%",
            top: "60%",
            width: "8%",
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
          }}
        />

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
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white text-[10px] font-bold text-gray-700 shadow-md"
        style={{ width: 64, height: 64 }}
      >
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
