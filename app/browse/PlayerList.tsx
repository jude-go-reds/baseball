import Link from "next/link";
import type { SearchEntry } from "@/lib/players/searchIndex";

export function PlayerList({ entries }: { entries: SearchEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No players found.</p>;
  }
  return (
    <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
      {entries.map((p) => (
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
  );
}
