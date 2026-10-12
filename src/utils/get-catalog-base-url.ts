import { CatalogSourceType } from "src/enums/catalog-source-type"
import { type CatalogSource } from "src/types/CatalogSource"

/**
 * URL every file of a remote catalog is relative to, ending with a slash:
 * `index.json` and `extensions/<id>/<file>` are appended to it. Uses each
 * host's raw file URL, so no host API is needed.
 */
export function getCatalogBaseUrl(source: CatalogSource): string {
  const url = new URL(source.location.trim())
  let branch = source.branch?.trim()
  if (!branch) {
    branch = "main"
  }
  branch = encodeURIComponent(branch)

  // Repo path without trailing slashes or a `.git` suffix
  const repoPath = url.pathname.replace(/\/+$/, "").replace(/\.git$/, "").replace(/^\/+/, "")

  switch (source.type) {
  case CatalogSourceType.GitHub: {
    const [owner, repo] = repoPath.split("/")
    if (!owner || !repo) {
      throw new Error("GitHub URL must look like https://github.com/owner/repo")
    }
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`
  }

  case CatalogSourceType.GitLab:
    // Groups can nest, so the whole path is the project
    return `${url.origin}/${repoPath}/-/raw/${branch}/`

  case CatalogSourceType.Gitea:
    return `${url.origin}/${repoPath}/raw/branch/${branch}/`

  case CatalogSourceType.Url:
    // Files sit next to the index
    return new URL(".", url).href

  case CatalogSourceType.Local:
    throw new Error("A local folder has no URL")
  }
}
