"use client";

import { SignInButton } from "@clerk/nextjs";

export function SignedOutPrompt() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Lineups are a sign-in feature.
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Sign in to build a fantasy team and share it with anyone via a link.
      </p>
      <div className="self-center">
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Sign in to continue
          </button>
        </SignInButton>
      </div>
    </div>
  );
}
