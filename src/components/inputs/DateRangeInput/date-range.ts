import dayjs, { type Dayjs } from "dayjs"

/**
 * A time range, each end either relative to now ("now", "now-15m") or an
 * ISO 8601 date with its offset ("2026-10-15T09:00:00+07:00")
 */
export interface DateRange {
  start: string
  end: string
}

export interface DateRangePreset {
  label: string
  start: string
  end: string
}

export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  { label: "Last 5 minutes", start: "now-5m", end: "now" },
  { label: "Last 15 minutes", start: "now-15m", end: "now" },
  { label: "Last 30 minutes", start: "now-30m", end: "now" },
  { label: "Last 1 hour", start: "now-1h", end: "now" },
  { label: "Last 6 hours", start: "now-6h", end: "now" },
  { label: "Last 24 hours", start: "now-24h", end: "now" },
  { label: "Last 7 days", start: "now-7d", end: "now" },
  { label: "Last 30 days", start: "now-30d", end: "now" }
]

/** "now", or "now-" with an amount and a unit: s, m, h, d or w */
export const RELATIVE_PATTERN = /^now(?:-(\d+)([smhdw]))?$/

const UNITS = { s: "second", m: "minute", h: "hour", d: "day", w: "week" } as const

export const ISO_FORMAT = "YYYY-MM-DDTHH:mm:ssZ"

/** How an absolute end is shown and typed: local time, to the second */
export const DISPLAY_FORMAT = "YYYY-MM-DD HH:mm:ss"

export const isRelative = (text: string) => RELATIVE_PATTERN.test(text.trim())

/**
 * The moment an end stands for: relative ones from the current time.
 * Undefined when it can't be read.
 */
export function resolveDateRangeEnd(text: string, now = dayjs()): Dayjs | undefined {
  const value = text.trim()
  const relative = RELATIVE_PATTERN.exec(value)
  if (relative) {
    const [, amount, unit] = relative
    return amount ? now.subtract(Number(amount), UNITS[unit as keyof typeof UNITS]) : now
  }
  const date = dayjs(value)
  return value && date.isValid() ? date : undefined
}

/**
 * A typed end as it's kept: relative ends as they are, any other date
 * dayjs reads as ISO with the local offset, so the tool knows its time zone
 */
export function normalizeDateRangeEnd(text: string): string {
  const value = text.trim()
  if (!value || isRelative(value)) {
    return value
  }
  const date = dayjs(value)
  return date.isValid() ? date.format(ISO_FORMAT) : value
}

/** An end as shown in its field: relative ones as they are, dates in local time */
export function formatDateRangeEnd(text: string): string {
  const value = text.trim()
  if (!value || isRelative(value)) {
    return value
  }
  const date = dayjs(value)
  return date.isValid() ? date.format(DISPLAY_FORMAT) : value
}

/** Accepts a range, or the JSON text of one, from a stored or typed value */
export function toDateRange(value: unknown): DateRange {
  let range = value
  if (typeof range === "string") {
    try {
      range = JSON.parse(range)
    } catch {
      range = undefined
    }
  }
  const record = (range && typeof range === "object" ? range : {}) as Partial<Record<keyof DateRange, unknown>>
  return {
    start: typeof record.start === "string" ? record.start : "",
    end: typeof record.end === "string" ? record.end : ""
  }
}
