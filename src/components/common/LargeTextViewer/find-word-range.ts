/**
 * Characters treated as part of a word on double click
 */
const WORD_CHAR = /[\p{L}\p{N}_$]/u

/**
 * Range of the word around `offset`, empty when it is not inside a word
 */
export function findWordRange(text: string, offset: number) {
  let from = offset
  let to = offset

  while (from > 0 && WORD_CHAR.test(text[from - 1])) {
    from--
  }
  while (to < text.length && WORD_CHAR.test(text[to])) {
    to++
  }

  return { from, to }
}
