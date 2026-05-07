import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">Baseball Cards</h1>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        Generate shareable cards for any MLB player. Search and live data are
        coming soon &mdash; for now, here&apos;s a demo card.
      </p>
      <Link
        href="/card/ruth"
        className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        View demo: Babe Ruth
      </Link>
    </main>
  );
}
