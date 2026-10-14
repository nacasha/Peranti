/**
 * Parse the JSON rows of a DataGrid, returns `undefined` when the value is not valid JSON rows
 */
export function parseDataGridRows(value: string): unknown[] | undefined {
  if (value.trim().length === 0) {
    return []
  }

  try {
    const rows = JSON.parse(value)
    return Array.isArray(rows) ? rows : undefined
  } catch {
    return undefined
  }
}
