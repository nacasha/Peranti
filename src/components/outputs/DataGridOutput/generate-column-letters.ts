const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

/**
 * Spreadsheet-style column names: A, B, ... Z, AA, AB, ...
 */
export function generateColumnLetters(count: number) {
  return Array.from({ length: Math.max(count, 0) }, (_, index) => {
    const letter = ALPHABET[index % 26]
    return index >= 26 ? ALPHABET[Math.floor(index / 26) - 1] + letter : letter
  })
}
