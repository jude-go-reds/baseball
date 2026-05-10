"use client";

import { useEffect, useState } from "react";

function isMothersDay2026(): boolean {
  const now = new Date();
  return (
    now.getFullYear() === 2026 && now.getMonth() === 4 && now.getDate() === 10
  );
}

export function MothersDayToast() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isMothersDay2026()) return;
    setVisible(true);
    const enter = window.setTimeout(() => setEntered(true), 50);
    const exit = window.setTimeout(() => setEntered(false), 8000);
    const remove = window.setTimeout(() => setVisible(false), 8400);
    return () => {
      window.clearTimeout(enter);
      window.clearTimeout(exit);
      window.clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-pink-200 bg-white p-4 shadow-lg transition-all duration-300 ease-out dark:border-pink-900 dark:bg-gray-950 ${
          entered ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 text-left">
          <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">
            Happy Mother&apos;s Day!
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Make a card for the mom who taught you to keep your eye on the
            ball.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEntered(false)}
          aria-label="Dismiss"
          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}
