/**
 * Text of the cell at `columnIndex`, rows may be arrays or objects
 */
export function getDataGridCellText(row: unknown, columnIndex: number) {
  if (row === null || typeof row !== "object") {
    return ""
  }

  return `${Object.values(row)[columnIndex] ?? ""}`
}
