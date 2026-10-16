import { ExtensionCatalog } from "src/constants/extension-catalog"
import { FileNames } from "src/constants/file-names"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { httpRequest } from "src/services/http-client"
import { type CatalogExtension, type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type CatalogSource } from "src/types/CatalogSource"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { readExtensionComponents, readExtensionTools } from "src/utils/extension/extension-definitions"
import { summarizeExtensionTool } from "src/utils/extension/extension-summary"

import { parseRepoLocation } from "./catalog-sources.js"

/**
 * Listing what a catalog holds: every file of a repo through its host's API,
 * and each extension's summary read from its definition files
 */

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

const BLOB_ENTRY_TYPE = "blob"
const EXECUTABLE_FILE_MODE = "100755"

/**
 * Pages read at most, a catalog bigger than this is refused
 */
const MAX_PAGES = 20

const GITLAB_PAGE_SIZE = 100
const GITEA_PAGE_SIZE = 1000

const HttpStatus = {
  forbidden: 403,
  notFound: 404,
  tooManyRequests: 429
}

const HostNames: Record<Exclude<CatalogSourceType, CatalogSourceType.Local>, string> = {
  [CatalogSourceType.GitHub]: "GitHub",
  [CatalogSourceType.GitLab]: "GitLab",
  [CatalogSourceType.Gitea]: "Gitea"
}

const TOO_LARGE_ERROR = "Catalog is too large to list"

const toFile = (entry: TreeEntry): CatalogExtensionFile => ({
  path: entry.path,
  size: entry.size,
  executable: entry.mode === EXECUTABLE_FILE_MODE,
  sha: entry.sha ?? entry.id
})

const toFiles = (entries: TreeEntry[]) => entries.filter((entry) => entry.type === BLOB_ENTRY_TYPE).map(toFile)

async function getJson<T>(url: string, hostName: string): Promise<T> {
  const response = await httpRequest(url, { method: "GET", headers: ExtensionCatalog.apiHeaders })

  if (response.status === HttpStatus.forbidden || response.status === HttpStatus.tooManyRequests) {
    throw new Error(`${hostName} rate limit reached, try again in a while`)
  }
  if (response.status === HttpStatus.notFound) {
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
  const { url, repoPath, branch } = parseRepoLocation(source)
  const ref = encodeURIComponent(branch)

  switch (source.type) {
  case CatalogSourceType.GitHub: {
    const [owner, repo] = repoPath.split("/")
    const tree = await getJson<{ tree: TreeEntry[], truncated: boolean }>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
      HostNames[source.type]
    )

    if (tree.truncated) {
      throw new Error(`${TOO_LARGE_ERROR} in one request`)
    }

    return toFiles(tree.tree)
  }

  case CatalogSourceType.GitLab: {
    const project = encodeURIComponent(repoPath)
    const files: CatalogExtensionFile[] = []

    for (let page = 1; page <= MAX_PAGES; page++) {
      const entries = await getJson<TreeEntry[]>(
        `${url.origin}/api/v4/projects/${project}/repository/tree?recursive=true&ref=${ref}&per_page=${GITLAB_PAGE_SIZE}&page=${page}`,
        HostNames[source.type]
      )
      files.push(...toFiles(entries))

      if (entries.length < GITLAB_PAGE_SIZE) {
        return files
      }
    }

    throw new Error(TOO_LARGE_ERROR)
  }

  case CatalogSourceType.Gitea: {
    const files: CatalogExtensionFile[] = []

    for (let page = 1; page <= MAX_PAGES; page++) {
      const tree = await getJson<{ tree: TreeEntry[] | null, truncated: boolean }>(
        `${url.origin}/api/v1/repos/${repoPath}/git/trees/${ref}?recursive=true&per_page=${GITEA_PAGE_SIZE}&page=${page}`,
        HostNames[source.type]
      )
      files.push(...toFiles(tree.tree ?? []))

      if (!tree.truncated) {
        return files
      }
    }

    throw new Error(TOO_LARGE_ERROR)
  }

  case CatalogSourceType.Local:
    throw new Error("Only repo sources can be listed through their host")
  }
}

/**
 * Text that changes whenever a file is added, removed or edited, from the
 * hashes the repo host gives. Undefined when a file has no hash, since a
 * change then can't be told.
 */
export function getCatalogFilesSignature(files: CatalogExtensionFile[] | undefined): string | undefined {
  if (!files || files.some((file) => !file.sha)) {
    return undefined
  }

  return files
    .map((file) => `${file.path}:${file.sha}`)
    .sort()
    .join("\n")
}

/**
 * Catalog entry of an extension folder, read from its `peranti.json` and the
 * definition files of its tools and components. Throws when any is broken.
 */
export async function readCatalogExtension(
  id: string,
  path: string,
  folder: ExtensionFolderReader,
  files: CatalogExtensionFile[],
  sourceId: string
): Promise<CatalogExtension> {
  const manifest: ExtensionManifest = JSON.parse(await folder.readText(FileNames.ExtensionDefinition))

  // Read at the same time, a remote catalog downloads each file
  const [tools, components] = await Promise.all([
    readExtensionTools(manifest, folder),
    readExtensionComponents(folder)
  ])

  return {
    id,
    name: manifest.name || id,
    description: manifest.description,
    version: manifest.version ?? ExtensionCatalog.unversioned,
    author: manifest.author,
    category: manifest.category,
    tools: tools.map(summarizeExtensionTool),
    components: components.map(({ definition, path: componentPath }) => ({
      componentId: definition.componentId,
      name: definition.name,
      description: definition.description,
      kind: definition.kind,
      value: definition.value,
      props: definition.props,
      entry: definition.entry,
      path: componentPath
    })),
    path,
    files,
    sourceId
  }
}
