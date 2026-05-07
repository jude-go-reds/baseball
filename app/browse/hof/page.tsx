import Link from "next/link";
import { getHallOfFamers } from "@/lib/players/searchIndex";
import { FilteredPlayerList } from "../FilteredPlayerList";

export default function HofPage() {
  const players = getHallOfFamers();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/browse" className="text-blue-600 hover:underline dark:text-blue-400">
          Browse
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">Hall of Fame</span>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Hall of Fame</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {players.length} inductees, sorted by induction year (most recent first).
        </p>
      </header>

      <FilteredPlayerList entries={players} hideHofToggle />
    </main>
  );
}
