"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  type Lineup,
  createLineup,
  deleteLineup,
  getLineupsServerSnapshot,
  getLineupsSnapshot,
  renameLineup,
  subscribeLineups,
} from "@/lib/lineups";
import { SLOTS } from "@/lib/lineups/positions";

export function MyLineups() {
  const { userId } = useAuth();
  const router = useRouter();
  const lineups = useSyncExternalStore(
    subscribeLineups,
    getLineupsSnapshot,
    getLineupsServerSnapshot,
  );

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    if (!userId) return;
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const lineup = await createLineup(name);
      setNewName("");
      setCreating(false);
      router.push(`/lineup/${userId}/${lineup.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {lineups.length} {lineups.length === 1 ? "lineup" : "lineups"}
        </p>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          {creating ? "Cancel" : "+ New lineup"}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onCreate();
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='e.g. "All-Time Yankees"'
            maxLength={80}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Create
          </button>
        </form>
      )}

      {lineups.length === 0 && !creating && (
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No lineups yet.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Create one above to start drafting your fantasy team.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {lineups.map((l) => (
          <LineupRow key={l.id} lineup={l} />
        ))}
      </div>
    </div>
  );
}

function LineupRow({ lineup: l }: { lineup: Lineup }) {
  const { userId } = useAuth();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(l.name);

  useEffect(() => {
    if (!renaming) setDraftName(l.name);
  }, [l.name, renaming]);

  const filled = SLOTS.filter((s) => Boolean(l.slots[s])).length;

  async function onRename() {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === l.name) {
      setRenaming(false);
      return;
    }
    await renameLineup(l.id, trimmed);
    setRenaming(false);
  }

  async function onDelete() {
    if (!confirm(`Delete "${l.name}"? This can't be undone.`)) return;
    await deleteLineup(l.id);
  }

  const href = userId ? `/lineup/${userId}/${l.id}` : "#";

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-4 py-3 dark:border-gray-800">
      {renaming ? (
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void onRename();
            } else if (e.key === "Escape") {
              setRenaming(false);
            }
          }}
          maxLength={80}
          className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
      ) : (
        <Link href={href} className="flex flex-1 items-baseline gap-3 hover:underline">
          <span className="font-medium">{l.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filled}/{SLOTS.length} filled
            {!l.positionLock && (
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                lock off
              </span>
            )}
          </span>
        </Link>
      )}
      <div className="flex items-center gap-1 text-xs">
        {renaming ? (
          <>
            <button
              type="button"
              onClick={() => void onRename()}
              className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setRenaming(false)}
              className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRenaming(true)}
              className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              className="rounded px-2 py-1 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
