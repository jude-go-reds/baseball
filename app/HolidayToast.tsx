"use client";

import { useEffect, useState } from "react";
import { activeHoliday, type Holiday } from "./holidays";

export function HolidayToast() {
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const today = activeHoliday(new Date());
    if (!today) return;

    // Only show once per holiday per year, even across page navigations.
    const dismissKey = `holiday-toast:${today.id}:${new Date().getFullYear()}`;
    try {
      if (window.localStorage.getItem(dismissKey)) return;
    } catch {
      // localStorage unavailable (private mode) — just show it.
    }

    setHoliday(today);
    const enter = window.setTimeout(() => setEntered(true), 50);
    const exit = window.setTimeout(() => setEntered(false), 8000);
    const remove = window.setTimeout(() => setHoliday(null), 8400);
    return () => {
      window.clearTimeout(enter);
      window.clearTimeout(exit);
      window.clearTimeout(remove);
    };
  }, []);

  if (!holiday) return null;

  const dismiss = () => {
    setEntered(false);
    try {
      window.localStorage.setItem(
        `holiday-toast:${holiday.id}:${new Date().getFullYear()}`,
        "1",
      );
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-amber-200 bg-white p-4 shadow-lg transition-all duration-300 ease-out dark:border-amber-900 dark:bg-gray-950 ${
          entered ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 text-left">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {holiday.title}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {holiday.message}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}
