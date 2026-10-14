/**
 * True when both arrays hold the same items (by reference) in the same order
 */
export function shallowEqualArrays<T>(a?: T[], b?: T[]) {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}
