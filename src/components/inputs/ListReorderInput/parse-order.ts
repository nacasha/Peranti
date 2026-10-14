/**
 * Read the stored order (JSON array of item indexes), invalid values give an empty order
 */
export function parseOrder(value: unknown): number[] {
  try {
    const order = JSON.parse(String(value))
    return Array.isArray(order) ? order : []
  } catch {
    return []
  }
}
