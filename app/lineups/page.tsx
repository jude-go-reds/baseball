import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { MyLineups } from "./MyLineups";
import { PlayerStatSearch } from "./PlayerStatSearch";
import { SignedOutPrompt } from "./SignedOutPrompt";

export default function LineupsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">Lineups</span>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Lineups</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Build a fantasy team — one player at each of the 9 positions plus a
          relief pitcher and DH — and see them on the field. Lineups are
          shareable: anyone with the link can view yours.
        </p>
      </header>

      <PlayerStatSearch />

      <Show when="signed-in">
        <MyLineups />
      </Show>
      <Show when="signed-out">
        <SignedOutPrompt />
      </Show>
    </main>
  );
}
