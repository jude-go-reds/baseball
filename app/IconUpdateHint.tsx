"use client";

import { useEffect, useState } from "react";

// Bump this when the home-screen icon changes again so existing dismissals
// don't suppress the next prompt.
const ICON_VERSION = "2";
const DISMISSED_KEY = "baseball-cards.iconHintDismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function IconUpdateHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (!isStandalone()) return;
    try {
      if (window.localStorage.getItem(DISMISSED_KEY) === ICON_VERSION) return;
    } catch {
      // no localStorage — show once, will re-prompt on next visit
    }
    setIos(isIos());
    setShow(true);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, ICON_VERSION);
    } catch {
      // no-op
    }
  }

  if (!show) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-md border border-gray-300 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-medium">We updated the app icon</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {ios
              ? "To see the new icon, long-press the Stat Cards icon and tap Remove, then open this site in Safari and Add to Home Screen again."
              : "To see the new icon, remove this app from your home screen and reinstall it."}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
