import Link from "next/link";
import { notFound } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { getAll } from "@/lib/players/searchIndex";
import type { Collection } from "@/app/api/collections/route";

type SearchEntry = {
  id: string;
  name: string;
  team: string;
  position: string;
  years: string;
  hofYear?: number;
};

function readCollections(publicMetadata: Record<string, unknown> | undefined): Collection[] {
  const raw = publicMetadata?.collections;
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is Collection => {
    return (
      typeof c === "object" &&
      c !== null &&
      typeof (c as Collection).id === "string" &&
      typeof (c as Collection).name === "string" &&
      Array.isArray((c as Collection).playerIds)
    );
  });
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const client = await clerkClient();
  const list = await client.users.getUserList({ username: [username] });
  const user = list.data[0];
  if (!user) notFound();

  const collections = readCollections(user.publicMetadata as Record<string, unknown>);

  // Resolve player IDs to names. Build a map once over the full search index.
  const allPlayers = getAll();
  const byId = new Map<string, SearchEntry>(
    allPlayers.map((p) => [p.id, p as SearchEntry]),
  );

  const displayName =
    user.username ?? user.firstName ?? user.id.slice(0, 8);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">@{username}</span>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{displayName}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {collections.length === 0
            ? "No public collections yet."
            : `${collections.length} ${collections.length === 1 ? "collection" : "collections"}`}
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          This user hasn&apos;t shared any collections.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {collections.map((c) => (
            <PublicCollection key={c.id} collection={c} byId={byId} />
          ))}
        </div>
      )}
    </main>
  );
}

function PublicCollection({
  collection: c,
  byId,
}: {
  collection: Collection;
  byId: Map<string, SearchEntry>;
}) {
  const players = c.playerIds
    .map((id) => byId.get(id))
    .filter((e): e is SearchEntry => Boolean(e));

  return (
    <section className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
      <div className="flex items-baseline justify-between gap-3 px-4 py-3">
        <h2 className="text-lg font-semibold">{c.name}</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {players.length} {players.length === 1 ? "player" : "players"}
        </span>
      </div>
      {players.length === 0 ? (
        <p className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Empty.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {players.map((p) => (
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
    </section>
  );
}
