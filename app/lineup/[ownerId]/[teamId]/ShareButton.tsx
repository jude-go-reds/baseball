"use client";

import { useState } from "react";

type Props = {
  ownerId: string;
  teamId: string;
  lineupName?: string;
};

export function ShareButton({ ownerId, teamId, lineupName }: Props) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/lineup/${ownerId}/${teamId}`;
    const title = lineupName ? `${lineupName} — Stat Cards` : "Stat Cards lineup";

    // Prefer the native share sheet on mobile.
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ url, title });
        return;
      } catch (err) {
        // User canceled — don't fall through.
        if (err instanceof Error && err.name === "AbortError") return;
        // Other error (eg. permission denied) — try clipboard.
      }
    }

    // Fallback: copy to clipboard.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this URL", url);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
    >
      {copied ? "Copied!" : "Share link"}
    </button>
  );
}
