/**
 * Whether `value` is a string big enough that editors should switch to a
 * lighter mode (no syntax highlighting or line wrapping) and auto-run should
 * wait for the user to stop typing.
 */
export function isLargeText(value: unknown, threshold: number = 200_000): value is string {
  return typeof value === "string" && value.length > threshold
}
