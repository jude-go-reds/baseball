import Link from "next/link";
import { PlayerSearch } from "./PlayerSearch";
import { InstallButton } from "./InstallButton";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">Stat Cards</h1>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        Type a player name to generate a shareable card. Every MLB player from
        1876 to today.
      </p>

      <PlayerSearch />

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link
          href="/browse"
          className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Browse galleries &rarr;
        </Link>
        <Link
          href="/library"
          className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Library &rarr;
        </Link>
        <Link
          href="/collections"
          className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Collections &rarr;
        </Link>
        <Link
          href="/lineups"
          className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          Lineups &rarr;
        </Link>
      </div>

      <InstallButton />
    </main>
  );
}
