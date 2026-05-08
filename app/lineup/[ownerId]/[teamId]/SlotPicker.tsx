"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerIndexEntry } from "@/lib/hooks/usePlayerIndex";
import { usePlayerIndex } from "@/lib/hooks/usePlayerIndex";
import { type Slot, SLOT_LABEL, slotAccepts } from "@/lib/lineups/positions";
import { mlbPhotoUrl } from "@/lib/photos/mlb";

type Props = {
  slot: Slot;
  positionLock: boolean;
  currentPlayerId: string | null;
  onPick: (playerId: string) => Promise<void> | void;
  onClose: () => void;
};

const MAX_RESULTS = 30;

export function SlotPicker({
  slot,
  positionLock,
  currentPlayerId,
  onPick,
  onClose,
}: Props) {
  const { byId } = usePlayerIndex(true);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape; trap focus loosely.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const eligible = useMemo(() => {
    if (!byId) return null;
    const all = Array.from(byId.values());
    if (!positionLock) return all;
    return all.filter((e) => slotAccepts(slot, e.position));
  }, [byId, positionLock, slot]);

  const fuse = useMemo(() => {
    if (!eligible) return null;
    return new Fuse(eligible, {
      keys: [
        { name: "name", weight: 1 },
        { name: "teams", weight: 0.3 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [eligible]);

  const results: PlayerIndexEntry[] = useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query.trim(), { limit: MAX_RESULTS }).map((r) => r.item);
  }, [fuse, query]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="slot-picker-title" className="text-lg font-semibold">
              Pick a {SLOT_LABEL[slot]}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {positionLock
                ? `Showing players who play ${slot}.`
                : "Showing all players (lock off)."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            !eligible
              ? "Loading…"
              : `Search ${eligible.length.toLocaleString()} players…`
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base dark:border-gray-700 dark:bg-gray-900"
        />

        <div className="flex-1 overflow-y-auto">
          {!query.trim() ? (
            <p className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Type a name to search.
            </p>
          ) : results.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              No matches.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => void onPick(p.id)}
                    className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mlbPhotoUrl(p.id)}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-200 bg-gray-50 object-cover dark:border-gray-800 dark:bg-gray-900"
                      loading="lazy"
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {[p.team, p.position, p.years].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {currentPlayerId === p.id && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        current
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
