"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function SignedOutButtons() {
  return (
    <>
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-base font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button
          type="button"
          className="rounded-md bg-black px-5 py-2.5 text-base font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Sign up
        </button>
      </SignUpButton>
    </>
  );
}
