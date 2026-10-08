const units = [
  { label: "d", ms: 86_400_000 },
  { label: "h", ms: 3_600_000 },
  { label: "min", ms: 60_000 },
  { label: "s", ms: 1_000 }
]

/**
 * Short distance from now, e.g. "in 21 h" or "5 min ago". Under a second is "now".
 */
export function formatShortRelativeTime(time: number, now: number = Date.now()) {
  const diff = time - now
  const unit = units.find((item) => Math.abs(diff) >= item.ms)

  if (!unit) {
    return "now"
  }

  const amount = Math.floor(Math.abs(diff) / unit.ms)
  return diff > 0 ? `in ${amount} ${unit.label}` : `${amount} ${unit.label} ago`
}
