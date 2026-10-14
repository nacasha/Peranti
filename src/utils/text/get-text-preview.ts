/**
 * One-line preview of the start of `text`, with whitespace collapsed, and
 * "…" when the text goes on past it. Mirrors `make_preview` in
 * src-tauri/src/history.rs.
 */
export function getTextPreview(text: string, length: number = 160) {
  const head = text.slice(0, length * 4)

  const collapsed = head.replace(/\s+/g, " ").trim()
  const preview = collapsed.slice(0, length)
  if (!preview) {
    return undefined
  }

  const isCut = collapsed.length > length || text.slice(head.length).trim() !== ""
  return isCut ? `${preview}…` : preview
}
