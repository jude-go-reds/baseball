// Recurring holiday definitions for the homepage toast.
// Dates are evaluated against the visitor's LOCAL date (see HolidayToast).
//
// A holiday's date can be:
//   - fixed:       same month/day every year (e.g. Christmas = Dec 25)
//   - nthWeekday:  the Nth given weekday of a month (e.g. Thanksgiving = 4th Thu of Nov)
//   - lastWeekday: the last given weekday of a month (e.g. Memorial Day = last Mon of May)
//   - easter:      computed via the Gregorian Computus (moves every year)

export type HolidayDate =
  | { kind: "fixed"; month: number; day: number } // month: 1-12
  | { kind: "nthWeekday"; month: number; weekday: number; n: number } // weekday: 0=Sun..6=Sat
  | { kind: "lastWeekday"; month: number; weekday: number }
  | { kind: "easter" };

export type Holiday = {
  id: string;
  title: string;
  message: string;
  date: HolidayDate;
};

// Gregorian Easter (Meeus/Jones/Butcher algorithm). Returns 1-based month/day.
function easterDate(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

// Day-of-month for the Nth `weekday` of `month` (1-based month).
function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): number {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset = (weekday - firstDow + 7) % 7;
  return 1 + offset + (n - 1) * 7;
}

// Day-of-month for the last `weekday` of `month` (1-based month).
function lastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
): number {
  const lastDom = new Date(year, month, 0).getDate(); // day 0 of next month
  const lastDow = new Date(year, month - 1, lastDom).getDay();
  const offset = (lastDow - weekday + 7) % 7;
  return lastDom - offset;
}

function resolveHoliday(
  date: HolidayDate,
  year: number,
): { month: number; day: number } {
  switch (date.kind) {
    case "fixed":
      return { month: date.month, day: date.day };
    case "nthWeekday":
      return {
        month: date.month,
        day: nthWeekdayOfMonth(year, date.month, date.weekday, date.n),
      };
    case "lastWeekday":
      return {
        month: date.month,
        day: lastWeekdayOfMonth(year, date.month, date.weekday),
      };
    case "easter":
      return easterDate(year);
  }
}

// Weekday constants for readability.
const SUN = 0;
const MON = 1;
const THU = 4;

export const HOLIDAYS: Holiday[] = [
  // Listed first so it wins on years it collides with Presidents Day (e.g. 2028, 2033).
  {
    id: "judes-birthday",
    title: "Happy Birthday, Jude!",
    message: "Make something in the app so its creator will be happy.",
    date: { kind: "fixed", month: 2, day: 21 },
  },
  {
    id: "new-years",
    title: "Happy New Year!",
    message: "Lead off a fresh season by making a card for someone you love.",
    date: { kind: "fixed", month: 1, day: 1 },
  },
  {
    id: "valentines",
    title: "Happy Valentine's Day!",
    message: "Make a card for your favorite battery mate.",
    date: { kind: "fixed", month: 2, day: 14 },
  },
  {
    id: "presidents-day",
    title: "Happy Presidents Day!",
    message: "Draft a card fit for an all-time franchise MVP.",
    date: { kind: "nthWeekday", month: 2, weekday: MON, n: 3 },
  },
  {
    id: "easter",
    title: "Happy Easter!",
    message: "Find a card worth more than the prize in the basket.",
    date: { kind: "easter" },
  },
  {
    id: "mothers-day",
    title: "Happy Mother's Day!",
    message: "Make a card for the mom who taught you to keep your eye on the ball.",
    date: { kind: "nthWeekday", month: 5, weekday: SUN, n: 2 },
  },
  {
    id: "memorial-day",
    title: "Memorial Day",
    message: "Make a card honoring someone who gave everything for the rest of us.",
    date: { kind: "lastWeekday", month: 5, weekday: MON },
  },
  {
    id: "juneteenth",
    title: "Happy Juneteenth!",
    message: "Celebrate the day with a card for a legend of the game.",
    date: { kind: "fixed", month: 6, day: 19 },
  },
  {
    id: "fathers-day",
    title: "Happy Father's Day!",
    message: "Make a card for the dad who played catch with you in the yard.",
    date: { kind: "nthWeekday", month: 6, weekday: SUN, n: 3 },
  },
  {
    id: "independence-day",
    title: "Happy Fourth of July!",
    message: "Make a card as American as baseball itself.",
    date: { kind: "fixed", month: 7, day: 4 },
  },
  {
    id: "veterans-day",
    title: "Veterans Day",
    message: "Make a card honoring a veteran in your lineup.",
    date: { kind: "fixed", month: 11, day: 11 },
  },
  {
    id: "thanksgiving",
    title: "Happy Thanksgiving!",
    message: "Make a card for someone on your roster you're grateful for.",
    date: { kind: "nthWeekday", month: 11, weekday: THU, n: 4 },
  },
  {
    id: "christmas",
    title: "Merry Christmas!",
    message: "Make a card to slip into someone's stocking.",
    date: { kind: "fixed", month: 12, day: 25 },
  },
];

// Returns the holiday landing on `now`'s local date, or null.
export function activeHoliday(now: Date): Holiday | null {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  for (const holiday of HOLIDAYS) {
    const resolved = resolveHoliday(holiday.date, year);
    if (resolved.month === month && resolved.day === day) return holiday;
  }
  return null;
}
