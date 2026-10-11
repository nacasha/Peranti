import { parseCsvRows } from "src/utils/parse-csv-rows.ts"

/**
 * Labels of the CSV columns: the first row, padded to the widest row
 */
export function getCsvColumnLabels(csv: string) {
  const { rows, columnCount } = parseCsvRows(csv)
  if (rows.length === 0) {
    return []
  }

  return Array.from({ length: columnCount }, (_, index) => rows[0][index] ?? "")
}
