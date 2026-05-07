import Link from "next/link";
import {
  getEras,
  getHallOfFamers,
  getTeams,
} from "@/lib/players/searchIndex";

export default function BrowseHub() {
  const teams = getTeams().slice(0, 30);
  const eras = getEras();
  const hofCount = getHallOfFamers().length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">Browse</span>
      </div>

      <h1 className="text-3xl font-bold sm:text-4xl">Browse</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Hall of Fame</h2>
        <Link
          href="/browse/hof"
          className="rounded-md border border-gray-300 px-4 py-3 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          {hofCount} inductees &rarr;
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">By era</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {eras.map(({ decade, count }) => (
            <Link
              key={decade}
              href={`/browse/era/${decade}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              <div className="font-medium">{decade}s</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{count}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">By team</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {teams.map(({ team, count }) => (
            <Link
              key={team}
              href={`/browse/team/${team}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              <div className="font-medium">{team}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{count}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
