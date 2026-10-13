import { getFileNameFromPath } from "./get-file-name-from-path.js"

/**
 * Returns the lowercased extension without the dot, or an empty string when the
 * file has none. Leading dots are ignored so ".gitignore" is treated as a name
 * rather than an extension.
 */
export function getFileExtension(path: string) {
  const fileName = getFileNameFromPath(path)
  const dotIndex = fileName.lastIndexOf(".")

  if (dotIndex <= 0 || dotIndex === fileName.length - 1) {
    return ""
  }

  return fileName.slice(dotIndex + 1).toLowerCase()
}
