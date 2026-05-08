"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchEntry = {
  id: string;
  name: string;
  team: string;
  teams: string[];
  position: string;
  years: string;
};

const PAGE_SIZE = 8;
const MAX_MATCHES = 200;

export function PlayerSearch() {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(0);
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
        { name: "teams", weight: 0.3 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [entries]);

  const allResults = useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse
      .search(query.trim(), { limit: MAX_MATCHES })
      .map((r) => r.item);
  }, [fuse, query]);

  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const results = allResults.slice(pageStart, pageStart + PAGE_SIZE);

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
          setPage(0);
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
          } else if (
            (e.key === "PageDown" ||
              (e.key === "ArrowRight" && e.altKey)) &&
            currentPage < totalPages - 1
          ) {
            e.preventDefault();
            setPage(currentPage + 1);
            setActiveIndex(0);
          } else if (
            (e.key === "PageUp" ||
              (e.key === "ArrowLeft" && e.altKey)) &&
            currentPage > 0
          ) {
            e.preventDefault();
            setPage(currentPage - 1);
            setActiveIndex(0);
          }
        }}
        disabled={entries === null}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-gray-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
      />

      {results.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-gray-900">
          <ul>
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              <span>
                {pageStart + 1}
                {String.fromCharCode(0x2013)}
                {pageStart + results.length} of {allResults.length}
                {allResults.length === MAX_MATCHES ? "+" : ""}
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPage(currentPage - 1);
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  disabled={currentPage === 0}
                  className="rounded border border-gray-300 px-2 py-1 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-gray-900"
                >
                  Prev
                </button>
                <span>
                  Page {currentPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPage(currentPage + 1);
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  disabled={currentPage >= totalPages - 1}
                  className="rounded border border-gray-300 px-2 py-1 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-gray-900"
                >
                  Next
                </button>
              </span>
            </div>
          )}
        </div>
      )}

      {query.trim() && fuse && allResults.length === 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No matches.</p>
      )}
    </div>
  );
}
