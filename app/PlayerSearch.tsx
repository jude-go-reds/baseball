"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchEntry = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
};

const MAX_RESULTS = 8;

export function PlayerSearch() {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/players.json")
      .then((r) => r.json() as Promise<SearchEntry[]>)
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const fuse = useMemo(() => {
    if (!entries) return null;
    return new Fuse(entries, {
      keys: [
        { name: "name", weight: 1 },
        { name: "team", weight: 0.3 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [entries]);

  const results = useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query.trim(), { limit: MAX_RESULTS }).map((r) => r.item);
  }, [fuse, query]);

  function go(entry: SearchEntry) {
    router.push(`/card/${entry.id}`);
  }

  return (
    <div className="w-full max-w-md">
      <input
        ref={inputRef}
        type="search"
        autoFocus
        placeholder={
          entries === null
            ? "Loading players…"
            : `Search ${entries.length.toLocaleString()} players…`
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={(e) => {
          if (results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(results[activeIndex]);
          }
        }}
        disabled={entries === null}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-gray-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
      />

      {results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-gray-900">
          {results.map((entry, i) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => go(entry)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left ${
                  i === activeIndex
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="font-medium">{entry.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {[entry.team, entry.position, entry.years]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query.trim() && fuse && results.length === 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No matches in active 2026 rosters. (Historical players coming in M4.)
        </p>
      )}
    </div>
  );
}
