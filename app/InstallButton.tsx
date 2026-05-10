"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // iPadOS reports as MacIntel, so check touchpoints too.
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  // In-app webviews on iOS can't Add to Home Screen — exclude them.
  return !/Instagram|FBAN|FBAV|Line|Twitter|Snapchat/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosFallback, setIosFallback] = useState(false);
  const [iosSheetOpen, setIosSheetOpen] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    if (isStandalone()) {
      setInstalled(true);
    } else if (detectIos()) {
      setIosFallback(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferredPrompt && !iosFallback) return null;

  async function onClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    if (iosFallback) {
      setIosSheetOpen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
      >
        Install app
      </button>
      {iosSheetOpen && (
        <IosInstructions onClose={() => setIosSheetOpen(false)} />
      )}
    </>
  );
}

function IosInstructions({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 text-left shadow-xl dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="ios-install-title" className="text-lg font-semibold">
            Install on iPhone or iPad
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <Step n={1} />
            <span>
              Tap the <ShareGlyph />{" "}
              <span className="font-medium">Share</span> button in your
              browser's toolbar.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Step n={2} />
            <span>
              Scroll down and tap{" "}
              <span className="font-medium">Add to Home Screen</span>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Step n={3} />
            <span>
              Tap <span className="font-medium">Add</span> to confirm.
            </span>
          </li>
        </ol>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          For the best experience, do this from Safari — installs from
          Chrome and Firefox open in their browser, not as a standalone app.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="self-end rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
      {n}
    </span>
  );
}

// Inline SVG of iOS Share icon (square + up arrow).
function ShareGlyph() {
  return (
    <svg
      className="inline-block h-4 w-4 align-middle text-blue-600 dark:text-blue-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
