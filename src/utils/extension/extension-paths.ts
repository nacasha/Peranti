import { FileNames } from "src/constants/file-names"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"

/**
 * Paths inside an extension: relative to its folder, with forward slashes
 */

const toSegments = (path: string) => path.split("/").filter((segment) => segment !== "" && segment !== ".")

/**
 * Joins paths relative to an extension folder, dropping empty and `.` segments
 */
export function joinRelativePaths(...paths: string[]): string {
  return paths.flatMap(toSegments).join("/")
}

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

/**
 * Path of a file a component's HTML links, relative to the component folder.
 * `href` is read relative to the HTML file, like a browser does, so a build
 * in a `dist` folder can link `./assets/index.js`. Undefined for a link to
 * another site, an absolute path, or one leaving the component folder.
 */
export function resolveComponentAssetPath(entry: string, href: string | null): string | undefined {
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("/") || href.includes("\\")) {
    return undefined
  }

  const segments = entry.split("/").slice(0, -1)

  for (const segment of toSegments(href.split(/[?#]/)[0])) {
    if (segment === "..") {
      if (segments.length === 0) return undefined
      segments.pop()
    } else {
      segments.push(segment)
    }
  }

  return segments.length > 0 ? segments.join("/") : undefined
}

/**
 * Whether a file is the record Peranti writes into an extension it installs,
 * see `ExtensionSource`. It isn't one of the extension's own files.
 */
export function isInstallRecord(path: string) {
  return path === FileNames.ExtensionSource
}

/**
 * The extension's own files, without the install record
 */
export function withoutInstallRecord<T extends Pick<CatalogExtensionFile, "path">>(files: T[]): T[] {
  return files.filter((file) => !isInstallRecord(file.path))
}
