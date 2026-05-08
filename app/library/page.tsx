import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { LibraryList } from "./LibraryList";
import { SignedOutPrompt } from "./SignedOutPrompt";

export default function LibraryPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">Library</span>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Players and teams you&apos;ve favorited. Synced to your account.
        </p>
      </header>

      <Show when="signed-in">
        <LibraryList />
      </Show>
      <Show when="signed-out">
        <SignedOutPrompt />
      </Show>
    </main>
  );
}
