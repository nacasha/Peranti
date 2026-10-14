import { generateColumnLetters } from "./generate-column-letters.ts"

export const DEFAULT_DATA_GRID_COLUMN_WIDTH = 150

/**
 * Build grid columns from the first row: array rows get letter titles, object rows use their keys
 */
export function createDataGridColumns(firstRow: unknown, widths: Record<number, number> = {}) {
  const titles = Array.isArray(firstRow)
    ? generateColumnLetters(firstRow.length)
    : Object.keys(firstRow ?? {})

  return titles.map((title, index) => ({
    id: title,
    title,
    width: widths[index] ?? DEFAULT_DATA_GRID_COLUMN_WIDTH
  }))
}
