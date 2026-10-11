/**
 * Find a CSV column by header name, or by 1-based position when no header matches
 */
export function resolveCsvColumnIndex(header: string[], column: string): number | undefined {
  const name = column.trim()
  if (name.length === 0) {
    return undefined
  }

  const index = header.findIndex((label) => label.trim() === name)
  if (index !== -1) {
    return index
  }

  const position = Number(name)
  if (Number.isInteger(position) && position >= 1) {
    return position - 1
  }

  return undefined
}
