/**
 * Lowercase words joined by dashes: "Word Count", "wordCount" and
 * "word_count" all become "word-count"
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
