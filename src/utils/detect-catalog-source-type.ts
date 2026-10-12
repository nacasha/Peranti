import { CatalogSourceType } from "src/enums/catalog-source-type"

/**
 * Guess the source type from what the user typed: a folder path, a known git
 * host, or a URL of an `index.json`. Undefined when it can't be told, such as
 * a self-hosted git server, so the user picks the type.
 */
export function detectCatalogSourceType(location: string): CatalogSourceType | undefined {
  const value = location.trim()

  if (value.startsWith("/") || value.startsWith("~") || /^[a-zA-Z]:[\\/]/.test(value)) {
    return CatalogSourceType.Local
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return undefined
  }

  if (url.pathname.endsWith(".json")) {
    return CatalogSourceType.Url
  }

  const host = url.hostname.toLowerCase()

  if (host === "github.com") {
    return CatalogSourceType.GitHub
  }

  if (host.includes("gitlab")) {
    return CatalogSourceType.GitLab
  }

  if (host === "codeberg.org" || host.includes("gitea") || host.includes("forgejo")) {
    return CatalogSourceType.Gitea
  }

  return undefined
}
