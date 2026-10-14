/**
 * Returns the directory part of a path, without the trailing separator.
 */
export function getDirectoryFromPath(path: string) {
  const separatorIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"))

  if (separatorIndex <= 0) {
    return ""
  }

  return path.slice(0, separatorIndex)
}
