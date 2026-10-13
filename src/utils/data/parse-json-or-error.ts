/**
 * Parsed JSON, or the parse error message. Empty text is null.
 */
export function parseJsonOrError(text: string): { value: unknown, error?: undefined } | { value?: undefined, error: string } {
  if (!text.trim()) {
    return { value: null }
  }

  try {
    return { value: JSON.parse(text) }
  } catch (exception) {
    return { error: exception instanceof Error ? exception.message : String(exception) }
  }
}
