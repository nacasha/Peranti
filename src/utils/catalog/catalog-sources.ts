import { DEFAULT_CATALOG_BRANCH } from "src/constants/extension-catalog"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { type CatalogSource } from "src/types/CatalogSource"

/**
 * Naming, keying and locating catalog sources
 */

const GITHUB_HOST = "github.com"
const CODEBERG_HOST = "codeberg.org"
const UNKNOWN_SOURCE_KEY_PREFIX = "unknown:"
const LOCAL_SOURCE_KEY_PREFIX = "local:"

/**
 * Host names that contain these are taken for that kind of git server
 */
const GITLAB_HOST_HINTS = ["gitlab"]
const GITEA_HOST_HINTS = ["gitea", "forgejo"]

const TRAILING_SEPARATORS = /[\\/]+$/
const PATH_SEPARATORS = /[\\/]/

interface RepoLocation {
  url: URL
  hostname: string

  /**
   * Repo path on its host without slashes around it or a `.git` suffix:
   * `owner/repo`, or `group/subgroup/repo` on GitLab
   */
  repoPath: string

  /**
   * Its branch, `main` when the source names none
   */
  branch: string
}

/**
 * Where a repo source points: its host, repo path and branch
 */
export function parseRepoLocation(source: CatalogSource): RepoLocation {
  const url = new URL(source.location.trim())
  const repoPath = url.pathname.replace(/\/+$/, "").replace(/\.git$/, "").replace(/^\/+/, "")
  const namedBranch = source.branch?.trim()
  const branch = namedBranch === undefined || namedBranch === "" ? DEFAULT_CATALOG_BRANCH : namedBranch

  return { url, hostname: url.hostname.toLowerCase(), repoPath, branch }
}

const withoutTrailingSeparators = (path: string) => path.trim().replace(TRAILING_SEPARATORS, "")

/**
 * Guess the source type from what the user typed: a folder path, a known git
 * host. Undefined when it can't be told, such as a self-hosted git server, so
 * the user picks the type.
 */
export function detectCatalogSourceType(location: string): CatalogSourceType | undefined {
  const value = location.trim()

  if (value.startsWith("/") || value.startsWith("~") || /^[a-zA-Z]:[\\/]/.test(value)) {
    return CatalogSourceType.Local
  }

  let host: string
  try {
    host = new URL(value).hostname.toLowerCase()
  } catch {
    return undefined
  }

  if (host === GITHUB_HOST) {
    return CatalogSourceType.GitHub
  }

  if (GITLAB_HOST_HINTS.some((hint) => host.includes(hint))) {
    return CatalogSourceType.GitLab
  }

  if (host === CODEBERG_HOST || GITEA_HOST_HINTS.some((hint) => host.includes(hint))) {
    return CatalogSourceType.Gitea
  }

  return undefined
}

/**
 * Stable name of a catalog source, built from where it points rather than
 * its per-machine ID, so the same catalog gets the same key everywhere:
 * `github.com/owner/repo`, `gitlab.com/group/repo@dev`, `local:/path/to/folder`.
 * Extensions installed from it are identified by this key plus their ID.
 */
export function getCatalogSourceKey(source: CatalogSource): string {
  if (source.type === CatalogSourceType.Local) {
    return LOCAL_SOURCE_KEY_PREFIX + withoutTrailingSeparators(source.location)
  }

  const { hostname, repoPath, branch } = parseRepoLocation(source)
  const key = `${hostname}/${repoPath}`

  return branch === DEFAULT_CATALOG_BRANCH ? key : `${key}@${branch}`
}

/**
 * Key of a source that can't be looked up any more, such as one since
 * removed. Its ID still keeps its extensions apart from other sources'.
 */
export function getUnknownSourceKey(sourceId: string): string {
  return UNKNOWN_SOURCE_KEY_PREFIX + sourceId
}

/**
 * Short name of a catalog source: `owner/repo` for GitHub, host and path for
 * other URLs, and the folder name for a local folder
 */
export function getCatalogSourceLabel(source: CatalogSource): string {
  if (source.type === CatalogSourceType.Local) {
    const folderName = withoutTrailingSeparators(source.location).split(PATH_SEPARATORS).pop()
    return folderName === undefined || folderName === "" ? source.location : folderName
  }

  try {
    const { hostname, repoPath } = parseRepoLocation(source)
    return hostname === GITHUB_HOST ? repoPath : `${hostname}/${repoPath}`
  } catch {
    return source.location
  }
}

/**
 * URL every file of a remote catalog is relative to, ending with a slash:
 * `extensions/<id>/<file>` is appended to it. Uses each host's raw file URL,
 * which has no rate limit.
 */
export function getCatalogBaseUrl(source: CatalogSource): string {
  const { url, repoPath, branch: rawBranch } = parseRepoLocation(source)
  const branch = encodeURIComponent(rawBranch)

  switch (source.type) {
  case CatalogSourceType.GitHub: {
    const [owner, repo] = repoPath.split("/")
    if (!owner || !repo) {
      throw new Error(`GitHub URL must look like https://${GITHUB_HOST}/owner/repo`)
    }
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`
  }

  case CatalogSourceType.GitLab:
    // Groups can nest, so the whole path is the project
    return `${url.origin}/${repoPath}/-/raw/${branch}/`

  case CatalogSourceType.Gitea:
    return `${url.origin}/${repoPath}/raw/branch/${branch}/`

  case CatalogSourceType.Local:
    throw new Error("A local folder has no URL")
  }
}
