import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { MyCollections } from "./MyCollections";
import { SignedOutPrompt } from "./SignedOutPrompt";

export default async function CollectionsPage() {
  const user = await currentUser();
  const username = user?.username ?? null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          &larr; Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium">Collections</span>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Collections</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Group favorited players into named lists. Visible to anyone at your
          public profile.
        </p>
        {username && (
          <p className="text-xs">
            Your public profile:{" "}
            <Link
              href={`/u/${username}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              /u/{username}
            </Link>
          </p>
        )}
      </header>

      <Show when="signed-in">
        <MyCollections />
      </Show>
      <Show when="signed-out">
        <SignedOutPrompt />
      </Show>
    </main>
  );
}
