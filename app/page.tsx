import Link from "next/link";
import { PlayerSearch } from "./PlayerSearch";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">Baseball Cards</h1>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        Type a player name to generate a shareable card.
      </p>

      <PlayerSearch />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Active 2026 rosters indexed. Historical players (e.g.{" "}
        <Link href="/card/121578" className="underline">
          Babe Ruth
        </Link>
        ,{" "}
        <Link href="/card/116539" className="underline">
          Derek Jeter
        </Link>
        ,{" "}
        <Link href="/card/115135" className="underline">
          Ken Griffey Jr.
        </Link>
        ) are reachable by URL — searchable in M4.
      </p>
    </main>
  );
}
