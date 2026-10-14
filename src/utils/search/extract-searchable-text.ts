/**
 * Upper bound of text kept per tab, so a pasted multi-megabyte JSON
 * cannot make every keystroke in the command bar slow
 */
const MAX_LENGTH = 100_000

/**
 * Flatten applet input values into one lowercase string for substring search.
 * Binary values (files, buffers) are skipped, objects are serialized as JSON.
 */
export function extractSearchableText(inputValues: Record<string, unknown> | undefined) {
  if (!inputValues) {
    return ""
  }

  const parts: string[] = []
  let length = 0

  for (const value of Object.values(inputValues)) {
    if (length >= MAX_LENGTH) break

    let text = ""
    if (typeof value === "string") {
      text = value
    } else if (typeof value === "number" || typeof value === "boolean") {
      text = String(value)
    } else if (
      value && typeof value === "object" &&
      !(value instanceof Blob) && !(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value)
    ) {
      try {
        text = JSON.stringify(value)
      } catch {
        text = ""
      }
    }

    if (text) {
      const sliced = text.slice(0, MAX_LENGTH - length)
      parts.push(sliced)
      length += sliced.length + 1
    }
  }

  return parts.join("\n").toLowerCase()
}
