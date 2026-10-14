import { type InstalledExtension } from "src/types/InstalledExtension"

/**
 * Value of the source picker on the Installed tab that lists `extension`:
 * its source key, or "hand-made" for folders added by hand
 */
export function getInstalledSourceFilter(extension: InstalledExtension): string {
  return extension.sourceKey ?? "hand-made"
}
