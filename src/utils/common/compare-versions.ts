/**
 * Compare dotted numeric versions ("1.2.10" > "1.2.9"), returning -1, 0 or 1.
 * Missing parts count as 0 and anything after a "-" is ignored.
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const toParts = (version: string) => version.split("-")[0].split(".").map((part) => Number.parseInt(part, 10) || 0)
  const partsA = toParts(a)
  const partsB = toParts(b)

  for (let index = 0; index < Math.max(partsA.length, partsB.length); index++) {
    const difference = (partsA[index] ?? 0) - (partsB[index] ?? 0)
    if (difference !== 0) {
      return difference > 0 ? 1 : -1
    }
  }

  return 0
}
