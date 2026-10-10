import { upperBound } from "src/utils/upper-bound"

/**
 * Maps a text onto a grid of fixed-width rows. Lines longer than `columns`
 * are hard-wrapped every `columns` characters, so with a monospace font the
 * position of any character is plain arithmetic and nothing has to be
 * measured or laid out by the browser.
 */
export class TextLayout {
  readonly totalRows: number

  /**
   * `rowStarts[i]` is the first visual row of line `i`, with one extra entry
   * holding the total row count
   */
  private readonly rowStarts: Float64Array

  constructor(
    readonly text: string,
    private readonly lineStarts: number[],
    readonly columns: number
  ) {
    this.rowStarts = new Float64Array(lineStarts.length + 1)

    for (let line = 0; line < lineStarts.length; line++) {
      const rows = Math.max(1, Math.ceil(this.lineLength(line) / columns))
      this.rowStarts[line + 1] = this.rowStarts[line] + rows
    }

    this.totalRows = this.rowStarts[lineStarts.length]
  }

  /**
   * Start offset of every line, computed once per text and shared between
   * layouts of different widths
   */
  static findLineStarts(text: string) {
    const lineStarts = [0]

    let index = text.indexOf("\n")
    while (index !== -1) {
      lineStarts.push(index + 1)
      index = text.indexOf("\n", index + 1)
    }

    return lineStarts
  }

  get lineCount() {
    return this.lineStarts.length
  }

  lineFrom(line: number) {
    return this.lineStarts[line]
  }

  /**
   * Offset of the end of the line, before its line break
   */
  lineTo(line: number) {
    return line + 1 < this.lineStarts.length
      ? this.lineStarts[line + 1] - 1
      : this.text.length
  }

  lineLength(line: number) {
    return this.lineTo(line) - this.lineFrom(line)
  }

  lineAtOffset(offset: number) {
    return upperBound(this.lineStarts, offset) - 1
  }

  lineAtRow(row: number) {
    return upperBound(this.rowStarts, row) - 1
  }

  /**
   * Text range shown on a visual row, and whether the row ends its line
   */
  rowRange(row: number) {
    const line = this.lineAtRow(row)
    const from = this.lineFrom(line) + (row - this.rowStarts[line]) * this.columns
    const lineTo = this.lineTo(line)
    const to = Math.min(from + this.columns, lineTo)

    return { from, to, isLineEnd: to === lineTo }
  }

  /**
   * Row and column of an offset. The end of a line that exactly fills its
   * last row stays on that row instead of starting an empty one.
   */
  offsetPosition(offset: number) {
    const line = this.lineAtOffset(offset)
    const column = offset - this.lineFrom(line)

    if (column > 0 && column === this.lineLength(line) && column % this.columns === 0) {
      return { row: this.rowStarts[line] + column / this.columns - 1, column: this.columns }
    }

    return {
      row: this.rowStarts[line] + Math.floor(column / this.columns),
      column: column % this.columns
    }
  }

  /**
   * Offset under a grid cell, clamped to the text
   */
  offsetAt(row: number, column: number) {
    if (row < 0) {
      return 0
    }
    if (row >= this.totalRows) {
      return this.text.length
    }

    const { from, to } = this.rowRange(row)
    return from + Math.min(Math.max(column, 0), to - from)
  }
}
