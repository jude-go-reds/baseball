"use client";

import { useState } from "react";

type Props = {
  ownerId: string;
  teamId: string;
};

export function ShareButton({ ownerId, teamId }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/lineup/${ownerId}/${teamId}`
        : `/lineup/${ownerId}/${teamId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — fall back to a prompt
      window.prompt("Copy this URL", url);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
    >
      {copied ? "Copied!" : "Share link"}
    </button>
  );
}
