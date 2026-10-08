import { getTextPreview } from "src/utils/get-text-preview"

/**
 * One line of text for any field value: strings as they are, everything
 * else as JSON. Undefined when there is nothing to show.
 */
export function toPreviewText(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined
  }

  if (typeof value === "string") {
    return getTextPreview(value)
  }

  try {
    return getTextPreview(JSON.stringify(value))
  } catch {
    return undefined
  }
}
