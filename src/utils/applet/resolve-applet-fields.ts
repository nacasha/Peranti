/**
 * Fields of a tool as a list. Some built-in tools build their fields from
 * the current values, those are read with no values and fall back to an
 * empty list when that throws.
 */
export function resolveAppletFields<T>(fields: T[] | ((values: any) => T[])): T[] {
  if (typeof fields !== "function") {
    return fields
  }

  try {
    const resolved = fields({})
    return Array.isArray(resolved) ? resolved : []
  } catch {
    return []
  }
}
