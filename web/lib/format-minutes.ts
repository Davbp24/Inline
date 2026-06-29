/** Format a minute count as a compact human-readable duration (e.g. 45m, 1h 30m). */
export function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
