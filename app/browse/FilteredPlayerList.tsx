"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/players/searchIndex";

const PAGE_SIZE = 200;

type Props = {
  entries: SearchEntry[];
  /** When true, omit the HoF-only checkbox (e.g. on the HoF page itself). */
  hideHofToggle?: boolean;
};

export function FilteredPlayerList({ entries, hideHofToggle = false }: Props) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [hofOnly, setHofOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const positions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.position) set.add(e.position);
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = name.trim().toLowerCase();
    return entries.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (position && e.position !== position) return false;
      if (hofOnly && e.hofYear === undefined) return false;
      return true;
    });
  }, [entries, name, position, hofOnly]);

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
  const hidden = filtered.length - visible.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="search"
          placeholder="Filter by name…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setShowAll(false);
          }}
          className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={position}
          onChange={(e) => {
            setPosition(e.target.value);
            setShowAll(false);
          }}
          className="rounded-md border border-gray-300 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {!hideHofToggle && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hofOnly}
              onChange={(e) => {
                setHofOnly(e.target.checked);
                setShowAll(false);
              }}
              className="h-4 w-4"
            />
            <span>HoF only</span>
          </label>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {filtered.length === entries.length
          ? `${filtered.length.toLocaleString()} players`
          : `${filtered.length.toLocaleString()} of ${entries.length.toLocaleString()} players`}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No matches.</p>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {visible.map((p) => (
            <li key={p.id}>
              <Link
                href={`/card/${p.id}`}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <span className="flex items-baseline gap-2">
                  <span className="font-medium">{p.name}</span>
                  {p.hofYear !== undefined && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                      HoF {p.hofYear}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {[p.team, p.position, p.years].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="self-center rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Show all {filtered.length.toLocaleString()} ({hidden.toLocaleString()} more)
        </button>
      )}
    </div>
  );
}
