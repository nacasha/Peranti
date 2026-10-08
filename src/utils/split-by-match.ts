/**
 * Splits `text` around every case-insensitive occurrence of `query`, so the
 * matches can be highlighted. Without a query the text is one plain part.
 */
export function splitByMatch(text: string, query: string | undefined) {
  if (!query) {
    return [{ text, isMatch: false }]
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // A capturing group keeps the matches in the result, at the odd indexes
  return text
    .split(new RegExp(`(${escaped})`, "gi"))
    .map((part, index) => ({ text: part, isMatch: index % 2 === 1 }))
    .filter((part) => part.text !== "")
}
