/**
 * Message of anything thrown, which isn't always an Error
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
