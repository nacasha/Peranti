/**
 * Day bucket for a timestamp: "Today", "Yesterday", or a date like "Oct 3"
 */
export function getDayGroupLabel(timestamp: number, now: number = Date.now()) {
  const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0)
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / 86_400_000)

  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"

  const date = new Date(timestamp)
  const sameYear = date.getFullYear() === new Date(now).getFullYear()

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric"
  })
}
