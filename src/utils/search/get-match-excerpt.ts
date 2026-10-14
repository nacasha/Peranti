/**
 * Single-line excerpt of `text` around the first occurrence of `keyword`,
 * used to show why a tab matched a search by its content
 */
export function getMatchExcerpt(text: string, keyword: string, radius: number = 24) {
  const index = text.indexOf(keyword)
  if (index === -1) {
    return ""
  }

  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + keyword.length + radius)
  const excerpt = text.slice(start, end).replace(/\s+/g, " ").trim()

  return (start > 0 ? "…" : "") + excerpt + (end < text.length ? "…" : "")
}
