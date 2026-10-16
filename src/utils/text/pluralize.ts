/**
 * The word for `count` things, a plural made by adding "s": "tool", "tools"
 */
export function pluralWord(count: number, word: string): string {
  return count === 1 ? word : `${word}s`
}

/**
 * A count with its word: "1 tool", "3 tools"
 */
export function pluralize(count: number, word: string): string {
  return `${count} ${pluralWord(count, word)}`
}
