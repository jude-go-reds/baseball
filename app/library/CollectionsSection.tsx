"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  type Collection,
  createCollection,
  deleteCollection,
  getCollectionsServerSnapshot,
  getCollectionsSnapshot,
  removePlayerFromCollection,
  renameCollection,
  subscribeCollections,
} from "@/lib/collections";

type SearchEntry = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
};

type Props = {
  /** Map of player id -> entry. Provided by LibraryList so we don't refetch. */
  index: Map<string, SearchEntry> | null;
};

export function CollectionsSection({ index }: Props) {
  const collections = useSyncExternalStore(
    subscribeCollections,
    getCollectionsSnapshot,
    getCollectionsServerSnapshot,
  );
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      await createCollection(name);
      setNewName("");
      setCreating(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Collections{" "}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({collections.length})
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          {creating ? "Cancel" : "+ New collection"}
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

      {collections.length === 0 && !creating && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No collections yet. Create one to group favorited players into named
          lists.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} index={index} />
        ))}
      </div>
    </section>
  );
}

function CollectionCard({
  collection: c,
  index,
}: {
  collection: Collection;
  index: Map<string, SearchEntry> | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(c.name);

  useEffect(() => {
    if (!renaming) setDraftName(c.name);
  }, [c.name, renaming]);

  const players = useMemo(() => {
    if (!index) return null;
    return c.playerIds
      .map((id) => index.get(id))
      .filter((e): e is SearchEntry => Boolean(e));
  }, [index, c.playerIds]);

  async function onRename() {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === c.name) {
      setRenaming(false);
      return;
    }
    await renameCollection(c.id, trimmed);
    setRenaming(false);
  }

  async function onDelete() {
    if (!confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    await deleteCollection(c.id);
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span aria-hidden className="text-xs text-gray-400">
            {expanded ? "▾" : "▸"}
          </span>
          {renaming ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
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
            <span className="font-medium">{c.name}</span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {c.playerIds.length}{" "}
            {c.playerIds.length === 1 ? "player" : "players"}
          </span>
        </button>
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

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          {c.playerIds.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No players yet. Add some from a card page.
            </p>
          ) : !players ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Loading…
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-4 py-2"
                >
                  <Link
                    href={`/card/${p.id}`}
                    className="flex flex-1 items-baseline justify-between gap-3 text-sm hover:underline"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {[p.team, p.position, p.years].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void removePlayerFromCollection(c.id, p.id)}
                    aria-label={`Remove ${p.name} from ${c.name}`}
                    className="rounded p-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-800"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
