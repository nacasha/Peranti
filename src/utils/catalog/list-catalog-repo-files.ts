import { ExtensionCatalog } from "src/constants/extension-catalog"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { httpRequest } from "src/services/http-client"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type CatalogSource } from "src/types/CatalogSource"

interface TreeEntry {
  path: string
  type: string
  mode: string
  size?: number

  /**
   * Blob hash: `sha` on GitHub and Gitea, `id` on GitLab
   */
  sha?: string
  id?: string
}

/**
 * Pages read at most, a catalog bigger than this is refused
 */
const MAX_PAGES = 20

const toFile = (entry: TreeEntry): CatalogExtensionFile => ({
  path: entry.path,
  size: entry.size,
  executable: entry.mode === "100755",
  sha: entry.sha ?? entry.id
})

const getJson = async<T>(url: string, hostName: string): Promise<T> => {
  const response = await httpRequest(url, { method: "GET", headers: ExtensionCatalog.apiHeaders })

  if (response.status === 403 || response.status === 429) {
    throw new Error(`${hostName} rate limit reached, try again in a while`)
  }
  if (response.status === 404) {
    throw new Error(`${hostName} can't find this repo or branch`)
  }
  if (!response.ok) {
    throw new Error(`${hostName} returned HTTP ${response.status}`)
  }

  return JSON.parse(new TextDecoder().decode(response.body))
}

/**
 * Every file of a catalog repo, paths relative to the repo root, listed
 * through the host's API: one request on GitHub, a few pages on GitLab and
 * Gitea. GitLab doesn't give file sizes.
 */
export async function listCatalogRepoFiles(source: CatalogSource): Promise<CatalogExtensionFile[]> {
  const url = new URL(source.location.trim())
  const repoPath = url.pathname.replace(/\/+$/, "").replace(/\.git$/, "").replace(/^\/+/, "")
  let branch = source.branch?.trim()
  if (!branch) {
    branch = "main"
  }
  const ref = encodeURIComponent(branch)

  switch (source.type) {
  case CatalogSourceType.GitHub: {
    const [owner, repo] = repoPath.split("/")
    const tree = await getJson<{ tree: TreeEntry[], truncated: boolean }>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
      "GitHub"
    )

    if (tree.truncated) {
      throw new Error("Catalog is too large to list in one request")
    }

    return tree.tree.filter((entry) => entry.type === "blob").map(toFile)
  }

  case CatalogSourceType.GitLab: {
    const project = encodeURIComponent(repoPath)
    const files: CatalogExtensionFile[] = []
    const perPage = 100

    for (let page = 1; page <= MAX_PAGES; page++) {
      const entries = await getJson<TreeEntry[]>(
        `${url.origin}/api/v4/projects/${project}/repository/tree?recursive=true&ref=${ref}&per_page=${perPage}&page=${page}`,
        "GitLab"
      )
      files.push(...entries.filter((entry) => entry.type === "blob").map(toFile))

      if (entries.length < perPage) {
        return files
      }
    }

    throw new Error("Catalog is too large to list")
  }

  case CatalogSourceType.Gitea: {
    const files: CatalogExtensionFile[] = []

    for (let page = 1; page <= MAX_PAGES; page++) {
      const tree = await getJson<{ tree: TreeEntry[] | null, truncated: boolean }>(
        `${url.origin}/api/v1/repos/${repoPath}/git/trees/${ref}?recursive=true&per_page=1000&page=${page}`,
        "Gitea"
      )
      files.push(...(tree.tree ?? []).filter((entry) => entry.type === "blob").map(toFile))

      if (!tree.truncated) {
        return files
      }
    }

    throw new Error("Catalog is too large to list")
  }

  case CatalogSourceType.Local:
    throw new Error("Only repo sources can be listed through their host")
  }
}
