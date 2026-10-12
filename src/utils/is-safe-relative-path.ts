/**
 * Whether a path from a download can be written inside its target folder
 * without escaping it: relative, forward slashes only, and no `..` segment
 */
export function isSafeRelativePath(path: string): boolean {
  if (!path || path.startsWith("/") || path.includes("\\") || /^[a-zA-Z]:/.test(path)) {
    return false
  }

  return path.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..")
}
