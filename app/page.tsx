import { PlayerSearch } from "./PlayerSearch";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">Baseball Cards</h1>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        Type a player name to generate a shareable card. Every MLB player from
        1876 to today.
      </p>

      <PlayerSearch />
    </main>
  );
}
