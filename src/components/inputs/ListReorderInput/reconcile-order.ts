/**
 * Keep `saved` indexes that still exist in a list of `count` items, then append the new ones.
 * An empty or stale `saved` order falls back to the natural order.
 */
export function reconcileOrder(saved: number[], count: number) {
  const kept = [...new Set(saved)].filter((index) => Number.isInteger(index) && index >= 0 && index < count)
  const appended = Array.from({ length: count }, (_, index) => index).filter((index) => !kept.includes(index))

  return [...kept, ...appended]
}
