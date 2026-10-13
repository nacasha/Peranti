import Papa from "papaparse"

/**
 * Rows of a CSV, its detected delimiter and the cell count of its widest row
 */
export function parseCsvRows(csv: string) {
  const { data: rows, meta } = Papa.parse<string[]>(csv, { skipEmptyLines: true })

  // Spreading every row into Math.max overflows the call stack on large files
  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0)

  return { rows, delimiter: meta.delimiter, columnCount }
}
