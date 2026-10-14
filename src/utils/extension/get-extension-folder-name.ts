/**
 * Folder a catalog extension is installed into, unique per source so two
 * catalogs can ship the same tool ID side by side, e.g.
 * `github.com-nacasha-peranti-extensions--sample-python-text`.
 * Never starts with a dot, the fs scope doesn't match hidden folders on Unix.
 */
export function getExtensionFolderName(sourceKey: string, toolId: string): string {
  const slug = (value: string) => value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[-.]+|-+$/g, "")

  return `${slug(sourceKey).slice(0, 80)}--${slug(toolId)}`
}
