"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  type Lineup,
  clearSlot,
  getLineupsServerSnapshot,
  getLineupsSnapshot,
  setPositionLock,
  setSlot,
  subscribeLineups,
} from "@/lib/lineups";
import type { Slot } from "@/lib/lineups/positions";
import { usePlayerIndex } from "@/lib/hooks/usePlayerIndex";
import { Field } from "./Field";
import { SlotPicker } from "./SlotPicker";
import { ShareButton } from "./ShareButton";

type Props = {
  ownerId: string;
  initialLineup: Lineup;
  isOwner: boolean;
};

export function LineupView({ ownerId, initialLineup, isOwner }: Props) {
  const live = useSyncExternalStore(
    subscribeLineups,
    getLineupsSnapshot,
    getLineupsServerSnapshot,
  );
  // Owners get the live, optimistic version once the store is hydrated.
  // Viewers always use the server snapshot.
  const lineup = useMemo<Lineup>(() => {
    if (!isOwner) return initialLineup;
    return live.find((l) => l.id === initialLineup.id) ?? initialLineup;
  }, [isOwner, live, initialLineup]);

  const [picking, setPicking] = useState<Slot | null>(null);
  const { byId } = usePlayerIndex(true);

  async function onPick(playerId: string) {
    if (!picking) return;
    await setSlot(lineup.id, picking, playerId);
    setPicking(null);
  }

  async function onClear(slot: Slot) {
    await clearSlot(lineup.id, slot);
  }

  async function onToggleLock() {
    await setPositionLock(lineup.id, !lineup.positionLock);
  }

  return (
    <div className="flex flex-col gap-4">
      {isOwner && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lineup.positionLock}
              onChange={() => void onToggleLock()}
              className="h-4 w-4"
            />
            Lock players to their position
          </label>
          <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:inline">
            {lineup.positionLock
              ? "Each slot only accepts players who play that position."
              : "Any player can fill any slot."}
          </span>
          <div className="ml-auto">
            <ShareButton ownerId={ownerId} teamId={lineup.id} />
          </div>
        </div>
      )}

      <Field
        lineup={lineup}
        byId={byId}
        onPick={isOwner ? (slot) => setPicking(slot) : undefined}
        onClear={isOwner ? onClear : undefined}
      />

      {picking && (
        <SlotPicker
          slot={picking}
          positionLock={lineup.positionLock}
          currentPlayerId={lineup.slots[picking] ?? null}
          onPick={onPick}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}
