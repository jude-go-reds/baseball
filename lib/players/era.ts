/** Every decade the player appeared in MLB, inclusive of debut & final year. */
export function playedDecades(years: string): number[] {
  const m = years.match(/^(\d{4})(?:\s*-\s*(\d{4}|present))?/);
  if (!m) return [];
  const start = Number(m[1]);
  const endRaw = m[2];
  const end = !endRaw
    ? start
    : endRaw === "present"
      ? new Date().getUTCFullYear()
      : Number(endRaw);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const startDecade = Math.floor(start / 10) * 10;
  const endDecade = Math.floor(end / 10) * 10;
  const out: number[] = [];
  for (let d = startDecade; d <= endDecade; d += 10) out.push(d);
  return out;
}
