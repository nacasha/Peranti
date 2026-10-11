import Papa from "papaparse"

/**
 * Labels of the CSV columns: the first row, padded to the widest row
 */
export function getCsvColumnLabels(csv: string) {
  const rows = Papa.parse<string[]>(csv, { skipEmptyLines: true }).data
  if (rows.length === 0) {
    return []
  }

  const columnCount = Math.max(...rows.map((row) => row.length))

  return Array.from({ length: columnCount }, (_, index) => rows[0][index] ?? "")
}
