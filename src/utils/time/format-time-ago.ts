const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MILLISECONDS_PER_SECOND = 1000

/**
 * What `formatTimeAgo` says for anything under a minute ago
 */
export const TIME_AGO_NOW = "now"

/**
 * Short relative time, e.g. "now", "5m", "3h", "2d"
 */
export function formatTimeAgo(timestamp: number, now: number = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / MILLISECONDS_PER_SECOND))
  if (seconds < SECONDS_PER_MINUTE) return TIME_AGO_NOW

  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
  if (minutes < MINUTES_PER_HOUR) return `${minutes}m`

  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  if (hours < HOURS_PER_DAY) return `${hours}h`

  return `${Math.floor(hours / HOURS_PER_DAY)}d`
}
