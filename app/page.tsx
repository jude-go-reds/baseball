import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { PlayerSearch } from "./PlayerSearch";
import { InstallButton } from "./InstallButton";

const NAV_BUTTON =
  "rounded-md border border-gray-300 px-5 py-2.5 text-base font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">Stat Cards</h1>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        Type a player name to generate a shareable card. Every MLB player from
        1876 to today.
      </p>

      <PlayerSearch />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/browse" className={NAV_BUTTON}>
          Browse galleries
        </Link>
        <Link href="/library" className={NAV_BUTTON}>
          Library
        </Link>
        <Link href="/collections" className={NAV_BUTTON}>
          Collections
        </Link>
        <Show when="signed-in">
          <Link href="/lineups" className={NAV_BUTTON}>
            Lineups
          </Link>
        </Show>
      </div>

      <InstallButton />
    </main>
  );
}
