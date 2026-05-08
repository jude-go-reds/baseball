"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  addPlayerToCollection,
  createCollection,
  getCollectionsServerSnapshot,
  getCollectionsSnapshot,
  removePlayerFromCollection,
  subscribeCollections,
} from "@/lib/collections";

export function AddToCollection({ playerId }: { playerId: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const collections = useSyncExternalStore(
    subscribeCollections,
    getCollectionsSnapshot,
    getCollectionsServerSnapshot,
  );
  const [open, setOpen] = useState(false);
  const [creatingName, setCreatingName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreatingName(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!isLoaded || !isSignedIn) return null;

  async function onToggle(collectionId: string, hasPlayer: boolean) {
    setBusy(true);
    try {
      if (hasPlayer) await removePlayerFromCollection(collectionId, playerId);
      else await addPlayerToCollection(collectionId, playerId);
    } finally {
      setBusy(false);
    }
  }

  async function onCreate() {
    const name = (creatingName ?? "").trim();
    if (!name) return;
    setBusy(true);
    try {
      const c = await createCollection(name);
      await addPlayerToCollection(c.id, playerId);
      setCreatingName(null);
    } finally {
      setBusy(false);
    }
  }

  const inCollections = collections.filter((c) => c.playerIds.includes(playerId));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
      >
        {inCollections.length > 0
          ? `In ${inCollections.length} collection${inCollections.length === 1 ? "" : "s"} ▾`
          : "Add to collection ▾"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-72 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {collections.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No collections yet — create one below.
            </p>
          ) : (
            <ul className="max-h-64 overflow-auto">
              {collections.map((c) => {
                const has = c.playerIds.includes(playerId);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => void onToggle(c.id, has)}
                      disabled={busy}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-800"
                    >
                      <span className="truncate">{c.name}</span>
                      <span
                        className={
                          has
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-gray-300 dark:text-gray-600"
                        }
                        aria-hidden
                      >
                        {has ? "✓" : "+"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-gray-200 dark:border-gray-800">
            {creatingName === null ? (
              <button
                type="button"
                onClick={() => setCreatingName("")}
                className="flex w-full items-center px-4 py-2 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                + New collection…
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void onCreate();
                }}
                className="flex gap-2 p-2"
              >
                <input
                  autoFocus
                  value={creatingName}
                  onChange={(e) => setCreatingName(e.target.value)}
                  placeholder="Collection name"
                  maxLength={80}
                  className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
                <button
                  type="submit"
                  disabled={busy || !creatingName.trim()}
                  className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  Create
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
