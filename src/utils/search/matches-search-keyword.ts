/**
 * Whether any of the texts contains the keyword, ignoring case. An empty
 * keyword matches everything.
 */
export function matchesSearchKeyword(keyword: string, texts: Array<string | undefined>): boolean {
  const query = keyword.trim().toLowerCase()
  if (!query) {
    return true
  }

  return texts.some((text) => text?.toLowerCase().includes(query))
}
