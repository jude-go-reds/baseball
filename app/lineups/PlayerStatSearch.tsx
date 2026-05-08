"use client";

import Link from "next/link";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import {
  type PlayerIndexEntry,
  usePlayerIndex,
} from "@/lib/hooks/usePlayerIndex";
import { mlbPhotoUrl } from "@/lib/photos/mlb";

const RESULT_LIMIT = 50;

type StatKey = "warBat" | "warPit" | "opsPlus" | "eraPlus";

type Filters = {
  name: string;
  position: string;
  hofOnly: boolean;
  minWarBat: string;
  minWarPit: string;
  minOpsPlus: string;
  minEraPlus: string;
};

const EMPTY_FILTERS: Filters = {
  name: "",
  position: "",
  hofOnly: false,
  minWarBat: "",
  minWarPit: "",
  minOpsPlus: "",
  minEraPlus: "",
};

export function PlayerStatSearch() {
  const { byId, failed } = usePlayerIndex(true);
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);

  const all = useMemo(() => {
    if (!byId) return null;
    return Array.from(byId.values());
  }, [byId]);

  const positions = useMemo(() => {
    if (!all) return [] as string[];
    const set = new Set<string>();
    for (const e of all) if (e.position) set.add(e.position);
    return Array.from(set).sort();
  }, [all]);

  const fuse = useMemo(() => {
    if (!all) return null;
    return new Fuse(all, {
      keys: [
        { name: "name", weight: 1 },
        { name: "teams", weight: 0.3 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [all]);

  const filtered = useMemo<PlayerIndexEntry[] | null>(() => {
    if (!all) return null;
    const minWarBat = parseNum(f.minWarBat);
    const minWarPit = parseNum(f.minWarPit);
    const minOpsPlus = parseNum(f.minOpsPlus);
    const minEraPlus = parseNum(f.minEraPlus);

    const base =
      f.name.trim() && fuse
        ? fuse.search(f.name.trim(), { limit: 500 }).map((r) => r.item)
        : all;

    return base.filter((e) => {
      if (f.position && e.position !== f.position) return false;
      if (f.hofOnly && e.hofYear === undefined) return false;
      if (minWarBat !== null && (e.warBat ?? -Infinity) < minWarBat) return false;
      if (minWarPit !== null && (e.warPit ?? -Infinity) < minWarPit) return false;
      if (minOpsPlus !== null && (e.opsPlus ?? -Infinity) < minOpsPlus) return false;
      if (minEraPlus !== null && (e.eraPlus ?? -Infinity) < minEraPlus) return false;
      return true;
    });
  }, [all, fuse, f]);

  const visible = filtered ? filtered.slice(0, RESULT_LIMIT) : null;
  const sortedVisible = useMemo(() => {
    if (!visible) return null;
    // When the user is filtering by a stat, sort by it. Otherwise alpha.
    const sortKey = pickSortKey(f);
    if (!sortKey) return visible;
    return [...visible].sort(
      (a, b) => (b[sortKey] ?? -Infinity) - (a[sortKey] ?? -Infinity),
    );
  }, [visible, f]);

  const update = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));

  const anyFilter =
    f.name.trim() ||
    f.position ||
    f.hofOnly ||
    f.minWarBat ||
    f.minWarPit ||
    f.minOpsPlus ||
    f.minEraPlus;

  return (
    <section className="flex flex-col gap-3 rounded-md border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">Find players</h2>
        {anyFilter && (
          <button
            type="button"
            onClick={() => setF(EMPTY_FILTERS)}
            className="text-xs text-gray-500 hover:underline dark:text-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      <input
        type="search"
        value={f.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Search by name…"
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base dark:border-gray-700 dark:bg-gray-900"
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={f.position}
          onChange={(e) => update({ position: e.target.value })}
          className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
          <input
            type="checkbox"
            checked={f.hofOnly}
            onChange={(e) => update({ hofOnly: e.target.checked })}
            className="h-4 w-4"
          />
          Hall of Fame
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumberField
          label="Min WAR (bat)"
          hint="career"
          value={f.minWarBat}
          onChange={(v) => update({ minWarBat: v })}
        />
        <NumberField
          label="Min WAR (pit)"
          hint="career"
          value={f.minWarPit}
          onChange={(v) => update({ minWarPit: v })}
        />
        <NumberField
          label="Min OPS+"
          hint="100 = avg"
          value={f.minOpsPlus}
          onChange={(v) => update({ minOpsPlus: v })}
        />
        <NumberField
          label="Min ERA+"
          hint="100 = avg"
          value={f.minEraPlus}
          onChange={(v) => update({ minEraPlus: v })}
        />
      </div>

      {failed && (
        <p className="text-xs text-rose-600 dark:text-rose-400">
          Couldn&apos;t load the player index. Reload the page to try again.
        </p>
      )}

      {!sortedVisible ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading…</p>
      ) : !anyFilter ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Type a name, pick a position, or set a stat threshold to find players.
        </p>
      ) : sortedVisible.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No matches.</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {filtered && filtered.length > RESULT_LIMIT
              ? `Top ${RESULT_LIMIT} of ${filtered.length.toLocaleString()}`
              : `${sortedVisible.length} ${sortedVisible.length === 1 ? "player" : "players"}`}
          </p>
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950">
            {sortedVisible.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/card/${p.id}`}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mlbPhotoUrl(p.id)}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-200 bg-gray-50 object-cover dark:border-gray-800 dark:bg-gray-900"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.hofYear !== undefined && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                          HoF
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {[p.team, p.position, p.years].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <StatPills entry={p} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
        {hint && (
          <span className="ml-1 font-normal normal-case text-gray-400">
            ({hint})
          </span>
        )}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-base dark:border-gray-700 dark:bg-gray-900"
      />
    </label>
  );
}

function StatPills({ entry }: { entry: PlayerIndexEntry }) {
  const pills: Array<{ label: string; value: string }> = [];
  if (entry.warBat !== undefined && entry.warBat >= 1) {
    pills.push({ label: "WAR", value: entry.warBat.toFixed(1) });
  } else if (entry.warPit !== undefined && entry.warPit >= 1) {
    pills.push({ label: "WAR", value: entry.warPit.toFixed(1) });
  }
  if (entry.opsPlus !== undefined) {
    pills.push({ label: "OPS+", value: String(entry.opsPlus) });
  } else if (entry.eraPlus !== undefined) {
    pills.push({ label: "ERA+", value: String(entry.eraPlus) });
  }
  if (pills.length === 0) return null;
  return (
    <div className="hidden flex-shrink-0 flex-col items-end gap-0.5 sm:flex">
      {pills.map((p) => (
        <span
          key={p.label}
          className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400"
        >
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {p.value}
          </span>{" "}
          {p.label}
        </span>
      ))}
    </div>
  );
}

function parseNum(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickSortKey(f: Filters): StatKey | null {
  if (f.minWarBat) return "warBat";
  if (f.minWarPit) return "warPit";
  if (f.minOpsPlus) return "opsPlus";
  if (f.minEraPlus) return "eraPlus";
  return null;
}
