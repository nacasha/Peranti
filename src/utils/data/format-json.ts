/**
 * Indented JSON for an editor, "null" for undefined
 */
export function formatJson(value: unknown): string {
  return JSON.stringify(value ?? null, undefined, 2)
}
