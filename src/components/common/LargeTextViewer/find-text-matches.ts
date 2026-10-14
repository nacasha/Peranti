/**
 * Stop counting past this many matches, so a one-letter query on a huge text
 * stays instant
 */
export const MAX_MATCHES = 100_000

/**
 * Start offsets of every match of `query` in `text`, up to MAX_MATCHES.
 * `foldedText` is the lower-cased text for case-insensitive search.
 */
export function findTextMatches(text: string, foldedText: string, query: string, caseSensitive: boolean) {
  const matches: number[] = []
  if (query.length === 0) {
    return matches
  }

  const foldedQuery = query.toLowerCase()

  // Lower-casing can change the length of some characters, offsets in the
  // folded text would then point to the wrong place
  const canFold = foldedText.length === text.length && foldedQuery.length === query.length
  const haystack = caseSensitive || !canFold ? text : foldedText
  const needle = caseSensitive || !canFold ? query : foldedQuery

  let index = haystack.indexOf(needle)
  while (index !== -1 && matches.length < MAX_MATCHES) {
    matches.push(index)
    index = haystack.indexOf(needle, index + needle.length)
  }

  return matches
}
