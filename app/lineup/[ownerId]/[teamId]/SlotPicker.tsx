"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import {
  type PlayerIndexEntry,
  usePlayerIndex,
} from "@/lib/hooks/usePlayerIndex";
import { type Slot, SLOT_LABEL, slotAccepts } from "@/lib/lineups/positions";
import { mlbPhotoUrl } from "@/lib/photos/mlb";

type Props = {
  slot: Slot;
  positionLock: boolean;
  currentPlayerId: string | null;
  onPick: (playerId: string) => Promise<void> | void;
  onClose: () => void;
};

const RESULT_LIMIT = 30;

type StatKey = "warBat" | "warPit" | "opsPlus" | "eraPlus";
type AwardKey =
  | "mvp"
  | "cyYoung"
  | "roy"
  | "wsChamp"
  | "wsMvp"
  | "allStar"
  | "goldGlove"
  | "silverSlugger";

type Filters = {
  name: string;
  hofOnly: boolean;
  minWarBat: string;
  minWarPit: string;
  minOpsPlus: string;
  minEraPlus: string;
  minMvp: string;
  minCyYoung: string;
  minRoy: string;
  minWsChamp: string;
  minAllStar: string;
  minGoldGlove: string;
  minSilverSlugger: string;
};

const EMPTY_FILTERS: Filters = {
  name: "",
  hofOnly: false,
  minWarBat: "",
  minWarPit: "",
  minOpsPlus: "",
  minEraPlus: "",
  minMvp: "",
  minCyYoung: "",
  minRoy: "",
  minWsChamp: "",
  minAllStar: "",
  minGoldGlove: "",
  minSilverSlugger: "",
};

const AWARD_FILTERS: Array<{ key: AwardKey; field: keyof Filters; label: string }> = [
  { key: "mvp", field: "minMvp", label: "MVP" },
  { key: "cyYoung", field: "minCyYoung", label: "Cy Young" },
  { key: "roy", field: "minRoy", label: "Rookie of Year" },
  { key: "wsChamp", field: "minWsChamp", label: "WS rings" },
  { key: "allStar", field: "minAllStar", label: "All-Star" },
  { key: "goldGlove", field: "minGoldGlove", label: "Gold Glove" },
  { key: "silverSlugger", field: "minSilverSlugger", label: "Silver Slugger" },
];

export function SlotPicker({
  slot,
  positionLock,
  currentPlayerId,
  onPick,
  onClose,
}: Props) {
  const { byId } = usePlayerIndex(true);
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);
  const [statsOpen, setStatsOpen] = useState(false);
  const [awardsOpen, setAwardsOpen] = useState(false);

  const isPitcherSlot = slot === "P" || slot === "RP";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Eligible pool — all players if lock off, slot-eligible if on.
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

  // Active stat thresholds.
  const minWarBat = parseNum(f.minWarBat);
  const minWarPit = parseNum(f.minWarPit);
  const minOpsPlus = parseNum(f.minOpsPlus);
  const minEraPlus = parseNum(f.minEraPlus);
  const awardMins: Partial<Record<AwardKey, number>> = {};
  for (const af of AWARD_FILTERS) {
    const n = parseNum(f[af.field] as string);
    if (n !== null) awardMins[af.key] = n;
  }

  const anyStatFilter =
    minWarBat !== null ||
    minWarPit !== null ||
    minOpsPlus !== null ||
    minEraPlus !== null;
  const anyAwardFilter = Object.keys(awardMins).length > 0;
  const anyFilter =
    Boolean(f.name.trim()) || f.hofOnly || anyStatFilter || anyAwardFilter;

  const filtered = useMemo<PlayerIndexEntry[] | null>(() => {
    if (!eligible) return null;
    const base =
      f.name.trim() && fuse
        ? fuse.search(f.name.trim(), { limit: 500 }).map((r) => r.item)
        : eligible;
    return base.filter((e) => {
      if (f.hofOnly && e.hofYear === undefined) return false;
      if (minWarBat !== null && (e.warBat ?? -Infinity) < minWarBat) return false;
      if (minWarPit !== null && (e.warPit ?? -Infinity) < minWarPit) return false;
      if (minOpsPlus !== null && (e.opsPlus ?? -Infinity) < minOpsPlus) return false;
      if (minEraPlus !== null && (e.eraPlus ?? -Infinity) < minEraPlus) return false;
      for (const [k, min] of Object.entries(awardMins)) {
        if ((e[k as AwardKey] ?? 0) < (min as number)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, fuse, f]);

  const sorted = useMemo<PlayerIndexEntry[] | null>(() => {
    if (!filtered) return null;
    const statKey = pickStatSortKey(f);
    const awardKey = pickAwardSortKey(f);
    const key = statKey ?? awardKey;
    if (!key) return filtered;
    return [...filtered].sort(
      (a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity),
    );
  }, [filtered, f]);

  const visible = sorted ? sorted.slice(0, RESULT_LIMIT) : null;

  const update = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-950"
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
          value={f.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder={
            !eligible
              ? "Loading…"
              : `Search ${eligible.length.toLocaleString()} players…`
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base dark:border-gray-700 dark:bg-gray-900"
        />

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900">
            <input
              type="checkbox"
              checked={f.hofOnly}
              onChange={(e) => update({ hofOnly: e.target.checked })}
              className="h-4 w-4"
            />
            Hall of Fame
          </label>
          <DisclosureButton
            label="Stats"
            open={statsOpen}
            active={anyStatFilter}
            onClick={() => setStatsOpen((v) => !v)}
          />
          <DisclosureButton
            label="Awards"
            open={awardsOpen}
            active={anyAwardFilter}
            onClick={() => setAwardsOpen((v) => !v)}
          />
          {anyFilter && (
            <button
              type="button"
              onClick={() => setF(EMPTY_FILTERS)}
              className="ml-auto text-xs text-gray-500 hover:underline dark:text-gray-400"
            >
              Clear
            </button>
          )}
        </div>

        {statsOpen && (
          <div className="grid grid-cols-2 gap-2">
            {isPitcherSlot ? (
              <>
                <NumberField
                  label="Min WAR (pit)"
                  value={f.minWarPit}
                  onChange={(v) => update({ minWarPit: v })}
                />
                <NumberField
                  label="Min ERA+"
                  hint="100 = avg"
                  value={f.minEraPlus}
                  onChange={(v) => update({ minEraPlus: v })}
                />
              </>
            ) : (
              <>
                <NumberField
                  label="Min WAR (bat)"
                  value={f.minWarBat}
                  onChange={(v) => update({ minWarBat: v })}
                />
                <NumberField
                  label="Min OPS+"
                  hint="100 = avg"
                  value={f.minOpsPlus}
                  onChange={(v) => update({ minOpsPlus: v })}
                />
              </>
            )}
          </div>
        )}

        {awardsOpen && (
          <div className="grid grid-cols-2 gap-2">
            {AWARD_FILTERS.map((a) => (
              <NumberField
                key={a.key}
                label={`Min ${a.label}`}
                value={f[a.field] as string}
                onChange={(v) => update({ [a.field]: v } as Partial<Filters>)}
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {!visible ? (
            <p className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Loading…
            </p>
          ) : !anyFilter ? (
            <p className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Type a name, toggle Hall of Fame, or set a stat threshold.
            </p>
          ) : visible.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              No matches.
            </p>
          ) : (
            <>
              {filtered && filtered.length > RESULT_LIMIT && (
                <p className="px-2 pb-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Top {RESULT_LIMIT} of {filtered.length.toLocaleString()}
                </p>
              )}
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {visible.map((p) => (
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
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.hofYear !== undefined && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                              HoF
                            </span>
                          )}
                          <AwardBadges entry={p} />
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {[p.team, p.position, p.years].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      <StatPills entry={p} />
                      {currentPlayerId === p.id && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          current
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DisclosureButton({
  label,
  open,
  active,
  onClick,
}: {
  label: string;
  open: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
    >
      {open ? `Hide ${label.toLowerCase()}` : `Filter by ${label.toLowerCase()}`}
      {active && !open && (
        <span className="ml-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          on
        </span>
      )}
    </button>
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

function AwardBadges({ entry }: { entry: PlayerIndexEntry }) {
  const badges: Array<{ label: string; value: number }> = [];
  if (entry.mvp) badges.push({ label: "MVP", value: entry.mvp });
  if (entry.cyYoung) badges.push({ label: "Cy", value: entry.cyYoung });
  if (entry.wsChamp) badges.push({ label: "WS", value: entry.wsChamp });
  if (entry.allStar) badges.push({ label: "AS", value: entry.allStar });
  if (badges.length === 0) return null;
  return (
    <>
      {badges.map((b) => (
        <span
          key={b.label}
          className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-900 dark:bg-blue-900/40 dark:text-blue-100"
        >
          {b.value > 1 ? `${b.value}× ${b.label}` : b.label}
        </span>
      ))}
    </>
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

function pickStatSortKey(f: Filters): StatKey | null {
  if (f.minWarBat) return "warBat";
  if (f.minWarPit) return "warPit";
  if (f.minOpsPlus) return "opsPlus";
  if (f.minEraPlus) return "eraPlus";
  return null;
}

function pickAwardSortKey(f: Filters): AwardKey | null {
  for (const af of AWARD_FILTERS) {
    if (f[af.field]) return af.key;
  }
  return null;
}
