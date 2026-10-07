import { type SearchQuery } from "@codemirror/search"
import { type EditorState } from "@uiw/react-codemirror"

/**
 * Count the matches of a search query and find which one the main selection
 * sits on (1-based, 0 when the selection is not on a match). Stops counting
 * at `limit` so huge documents stay responsive.
 */
export function countSearchMatches(state: EditorState, query: SearchQuery, limit = 9999) {
  if (!query.valid) {
    return { total: 0, current: 0, capped: false }
  }

  const { from, to } = state.selection.main
  const cursor = query.getCursor(state)

  let total = 0
  let current = 0

  for (let next = cursor.next(); !next.done; next = cursor.next()) {
    total += 1

    if (next.value.from === from && next.value.to === to) {
      current = total
    }
    if (total >= limit) {
      return { total, current, capped: true }
    }
  }

  return { total, current, capped: false }
}
