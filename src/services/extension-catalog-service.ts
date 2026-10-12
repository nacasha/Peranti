import { homeDir } from "@tauri-apps/api/path"
import { exists, mkdir, readDir, readFile, readTextFile, remove, rename, stat, writeFile, writeTextFile } from "@tauri-apps/plugin-fs"
import { makeAutoObservable } from "mobx"

import { ExtensionCatalog } from "src/constants/extension-catalog"
import { FileNames } from "src/constants/file-names"
import { Folders } from "src/constants/folders"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { type CatalogExtension, type CatalogExtensionFile, type CatalogIndex } from "src/types/CatalogExtension"
import { type CatalogSource } from "src/types/CatalogSource"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionSource } from "src/types/ExtensionSource"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { compareVersions } from "src/utils/compare-versions"
import { getCatalogBaseUrl } from "src/utils/get-catalog-base-url"
import { getCatalogSourceKey } from "src/utils/get-catalog-source-key"
import { getCatalogSourceLabel } from "src/utils/get-catalog-source-label"
import { getExtensionFolderName } from "src/utils/get-extension-folder-name"
import { getExtensionId } from "src/utils/get-extension-id"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"
import { isSafeRelativePath } from "src/utils/is-safe-relative-path"
import { readExtensionComponents } from "src/utils/read-extension-components"
import { readExtensionTools } from "src/utils/read-extension-tools"
import { summarizeExtensionTool } from "src/utils/summarize-extension-tool"

import { appDataService } from "./app-data-service.js"
import { appletStore } from "./applet-store.js"
import { extensionsService } from "./extensions-service.js"
import { fileService } from "./file-service.js"
import { httpRequest } from "./http-client.js"
import { userSettingsService } from "./user-settings-service.js"

export type CatalogExtensionStatus = "not-installed" | "installed" | "update-available" | "conflict"

interface CatalogSourceState {
  isLoading: boolean
  isLoaded: boolean
  error?: string
  extensions: CatalogExtension[]
}

interface GitTreeEntry {
  path: string
  type: "blob" | "tree" | "commit"
  mode: string
  size?: number
}

/**
 * Files downloaded at the same time while installing
 */
const DOWNLOAD_CONCURRENCY = 6

/**
 * Names never listed or installed from a local folder
 */
const IGNORED_FILE_NAMES = new Set(["node_modules", FileNames.ExtensionSource])

/**
 * Lists the extensions of every catalog source and installs them by copying
 * only the files of the extension's own folder
 */
class ExtensionCatalogService {
  /**
   * Sources the user added, the default source is always listed first
   */
  @userSettingsService.watch(UserSettingsKeys.extensionsCatalogSources)
  customSources: CatalogSource[] = userSettingsService.get(
    UserSettingsKeys.extensionsCatalogSources,
    []
  )

  @userSettingsService.watch(UserSettingsKeys.extensionsDisabledCatalogSources)
  disabledSourceIds: string[] = userSettingsService.get(
    UserSettingsKeys.extensionsDisabledCatalogSources,
    []
  )

  sourceStates: Record<string, CatalogSourceState> = {}

  /**
   * IDs of extensions being installed or updated
   */
  installingIds: string[] = []

  /**
   * Downloaded remote files shown in the file preview, by source, extension
   * and path
   */
  private readonly previewCache = new Map<string, Uint8Array>()

  constructor() {
    makeAutoObservable<this, "previewCache">(this, { previewCache: false })
    userSettingsService.watchStore(this)
  }

  get sources(): CatalogSource[] {
    return [ExtensionCatalog.defaultSource, ...this.customSources]
  }

  get enabledSources() {
    return this.sources.filter((source) => this.isSourceEnabled(source.id))
  }

  get isLoading() {
    return this.enabledSources.some((source) => this.sourceStates[source.id]?.isLoading)
  }

  get isLoaded() {
    return this.enabledSources.every((source) => this.sourceStates[source.id]?.isLoaded)
  }

  /**
   * Sources that failed to load, with the reason
   */
  get failedSources() {
    return this.enabledSources
      .map((source) => ({ source, error: this.sourceStates[source.id]?.error }))
      .filter((item): item is { source: CatalogSource, error: string } => !!item.error)
  }

  /**
   * Extensions of every enabled source, the same ID can be listed by more
   * than one source
   */
  get catalogExtensions(): CatalogExtension[] {
    return this.enabledSources
      .flatMap((source) => this.sourceStates[source.id]?.extensions ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  get updateCount() {
    return extensionsService.installedExtensions.filter((extension) => this.getUpdate(extension)).length
  }

  getSource(sourceId: string) {
    return this.sources.find((source) => source.id === sourceId)
  }

  getSourceLabel(sourceId: string) {
    const source = this.getSource(sourceId)
    return source ? getCatalogSourceLabel(source) : sourceId
  }

  /**
   * Label of the source an installed extension came from, by its source key.
   * Falls back to the label saved at install time once the source is removed.
   */
  getInstalledSourceLabel(extension: InstalledExtension) {
    const source = this.sources.find((item) => getCatalogSourceKey(item) === extension.sourceKey)
    if (source) {
      return getCatalogSourceLabel(source)
    }

    return extension.source?.catalog ?? extension.sourceKey ?? "Added by hand"
  }

  isSourceEnabled(sourceId: string) {
    return !this.disabledSourceIds.includes(sourceId)
  }

  setSourceEnabled(sourceId: string, enabled: boolean) {
    const disabledSourceIds = this.disabledSourceIds.filter((id) => id !== sourceId)
    this.disabledSourceIds = enabled ? disabledSourceIds : [...disabledSourceIds, sourceId]

    const source = this.getSource(sourceId)
    if (enabled && source) {
      void this.loadSource(source)
    }
  }

  /**
   * Check that a source lists extensions, then save it. Throws with the
   * reason when it can't be read, so nothing broken is saved.
   */
  async addSource(source: Omit<CatalogSource, "id">) {
    let location = source.location.trim()

    if (source.type === CatalogSourceType.Local && location.startsWith("~")) {
      location = (await homeDir()).replace(/\/+$/, "") + location.slice(1)
    }

    const branch = source.branch?.trim()
    const newSource: CatalogSource = {
      ...source,
      location,
      branch: branch === "" ? undefined : branch,
      id: `source-${Date.now().toString(36)}`
    }

    const newSourceKey = getCatalogSourceKey(newSource)
    if (this.sources.some((existing) => getCatalogSourceKey(existing) === newSourceKey)) {
      throw new Error("This source is already added")
    }

    const extensions = await this.fetchSourceExtensions(newSource, true)

    this.addCustomSource(newSource)
    this.setSourceState(newSource.id, { isLoading: false, isLoaded: true, extensions })

    return extensions.length
  }

  private addCustomSource(source: CatalogSource) {
    this.customSources = [...this.customSources, source]
  }

  removeSource(sourceId: string) {
    if (sourceId === ExtensionCatalog.defaultSource.id) {
      return
    }

    this.customSources = this.customSources.filter((source) => source.id !== sourceId)
    this.disabledSourceIds = this.disabledSourceIds.filter((id) => id !== sourceId)

    const { [sourceId]: _removed, ...sourceStates } = this.sourceStates
    this.sourceStates = sourceStates
  }

  private setSourceState(sourceId: string, state: Partial<CatalogSourceState>) {
    const current = this.sourceStates[sourceId] ?? { isLoading: false, isLoaded: false, extensions: [] }
    this.sourceStates = { ...this.sourceStates, [sourceId]: { ...current, ...state } }
  }

  private setInstalling(id: string, isInstalling: boolean) {
    this.installingIds = isInstalling
      ? [...this.installingIds, id]
      : this.installingIds.filter((installingId) => installingId !== id)
  }

  isInstalling(id: string) {
    return this.installingIds.includes(id)
  }

  findCatalogExtension(sourceId: string, id: string) {
    return this.sourceStates[sourceId]?.extensions.find((entry) => entry.id === id)
  }

  /**
   * Stable key of the source that lists `entry`, see `getCatalogSourceKey`
   */
  getEntrySourceKey(entry: CatalogExtension) {
    const source = this.getSource(entry.sourceId)
    return source ? getCatalogSourceKey(source) : `unknown:${entry.sourceId}`
  }

  /**
   * ID the entry's tool is registered under once installed
   */
  getEntryExtensionId(entry: CatalogExtension) {
    return getExtensionId(this.getEntrySourceKey(entry), entry.id)
  }

  /**
   * Catalog entry of a newer version of an installed extension, looked up in
   * the source it was installed from
   */
  getUpdate(extension: InstalledExtension): CatalogExtension | undefined {
    if (!extension.source || !extension.sourceKey) {
      return undefined
    }

    const source = this.enabledSources.find((item) => getCatalogSourceKey(item) === extension.sourceKey)
    if (!source) {
      return undefined
    }

    const entry = this.findCatalogExtension(source.id, extension.source.id)
    if (entry && compareVersions(entry.version, extension.source.version) > 0) {
      return entry
    }

    return undefined
  }

  getInstalled(entry: CatalogExtension) {
    const extensionId = this.getEntryExtensionId(entry)
    return extensionsService.installedExtensions.find((extension) => extension.id === extensionId)
  }

  getStatus(entry: CatalogExtension): CatalogExtensionStatus {
    const installed = this.getInstalled(entry)

    if (installed) {
      return this.getUpdate(installed) ? "update-available" : "installed"
    }

    /**
     * A folder added by hand under the name it would be installed into
     */
    const folderName = getExtensionFolderName(this.getEntrySourceKey(entry), entry.id)
    if (extensionsService.installedExtensions.some((extension) => extension.folderName === folderName)) {
      return "conflict"
    }

    return "not-installed"
  }

  /**
   * Load every enabled source, each only once per session unless forced
   */
  async loadCatalog(force = false) {
    await Promise.all(this.enabledSources.map(async(source) => { await this.loadSource(source, force) }))
  }

  async loadSource(source: CatalogSource, force = false) {
    const state = this.sourceStates[source.id]
    if (state?.isLoading || (state?.isLoaded && !force)) {
      return
    }

    this.setSourceState(source.id, { isLoading: true })

    try {
      const extensions = await this.fetchSourceExtensions(source, force)
      this.setSourceState(source.id, { isLoading: false, isLoaded: true, error: undefined, extensions })
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : String(exception)
      this.setSourceState(source.id, { isLoading: false, isLoaded: true, error: message })
    }
  }

  private async fetchSourceExtensions(source: CatalogSource, bustCache: boolean): Promise<CatalogExtension[]> {
    if (source.type === CatalogSourceType.Local) {
      return await this.readLocalSource(source)
    }

    const indexUrl = getCatalogBaseUrl(source) + ExtensionCatalog.indexFileName
    // Raw file CDNs cache for a few minutes, a query busts it on refresh
    const response = await httpRequest(bustCache ? `${indexUrl}?t=${Date.now()}` : indexUrl, { method: "GET" })

    if (response.status === 404) {
      throw new Error(`No ${ExtensionCatalog.indexFileName} at ${indexUrl}`)
    }

    if (!response.ok) {
      throw new Error(`${indexUrl} returned HTTP ${response.status}`)
    }

    let index: CatalogIndex
    try {
      index = JSON.parse(new TextDecoder().decode(response.body))
    } catch {
      throw new Error(`${ExtensionCatalog.indexFileName} is not valid JSON`)
    }

    if (!Array.isArray(index.extensions)) {
      throw new Error(`${ExtensionCatalog.indexFileName} has no extensions list`)
    }

    return index.extensions
      .filter((entry) => entry?.id && entry.name && entry.path)
      .map((entry) => ({ ...entry, sourceId: source.id }))
  }

  /**
   * Every file under `folderPath`, relative to it, skipping hidden files and
   * the install record
   */
  async listFolderFiles(folderPath: string): Promise<CatalogExtensionFile[]> {
    const files: CatalogExtensionFile[] = []

    const walk = async(relativeFolder: string) => {
      const absoluteFolder = relativeFolder ? await fileService.resolveFilePath(folderPath, relativeFolder) : folderPath

      for (const entry of await readDir(absoluteFolder)) {
        // Hidden entries can't be read through the fs scope, and aren't installed
        if (IGNORED_FILE_NAMES.has(entry.name) || entry.name.startsWith(".")) continue
        const relativePath = relativeFolder ? `${relativeFolder}/${entry.name}` : entry.name

        if (entry.isDirectory) {
          await walk(relativePath)
        } else if (entry.isFile) {
          const info = await stat(await fileService.resolveFilePath(folderPath, relativePath))
          files.push({
            path: relativePath,
            size: info.size,
            executable: info.mode !== null && (info.mode & 0o111) !== 0
          })
        }
      }
    }

    await walk("")
    return files
  }

  /**
   * A local folder lists every subfolder with a `peranti.json`, from its
   * `extensions` folder when it has one, so no index has to be built
   */
  private async readLocalSource(source: CatalogSource): Promise<CatalogExtension[]> {
    if (!isRunningInTauri) {
      throw new Error("Local folders need the desktop app")
    }

    if (!(await exists(source.location))) {
      throw new Error(`${source.location} does not exist`)
    }

    const nestedFolder = await fileService.resolveFilePath(source.location, ExtensionCatalog.extensionsFolderName)
    const extensionsFolder = await exists(nestedFolder) ? nestedFolder : source.location
    const extensions: CatalogExtension[] = []

    for (const entry of await readDir(extensionsFolder)) {
      if (!entry.isDirectory || entry.name.startsWith(".")) continue

      const folderPath = await fileService.resolveFilePath(extensionsFolder, entry.name)
      const manifestPath = await fileService.resolveFilePath(folderPath, FileNames.ExtensionDefinition)
      if (!(await exists(manifestPath))) continue

      try {
        const manifest: ExtensionManifest = JSON.parse(await readTextFile(manifestPath))

        extensions.push({
          id: entry.name,
          name: manifest.name || entry.name,
          description: manifest.description,
          version: manifest.version ?? "0.0.0",
          author: manifest.author,
          category: manifest.category,
          tools: (await readExtensionTools(manifest, folderPath, async(path) => await readTextFile(path))).map(summarizeExtensionTool),
          components: (await readExtensionComponents(manifest, folderPath, async(path) => await readTextFile(path)))
            .map(({ definition, path }) => ({
              componentId: definition.componentId,
              name: definition.name,
              description: definition.description,
              kind: definition.kind,
              path
            })),
          path: folderPath,
          files: await this.listFolderFiles(folderPath),
          sourceId: source.id
        })
      } catch {
        // A broken manifest only hides that one folder from the list
      }
    }

    return extensions
  }

  /**
   * Indexes built before file lists were added are still installable from
   * GitHub, by listing the repo through its API
   */
  private async getFilesFromGitHubTree(source: CatalogSource, entry: CatalogExtension): Promise<CatalogExtensionFile[]> {
    const [owner, repo] = new URL(source.location).pathname.replace(/^\/+/, "").replace(/\.git$/, "").split("/")
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${source.branch ?? "main"}?recursive=1`
    const response = await httpRequest(treeUrl, { method: "GET", headers: ExtensionCatalog.apiHeaders })

    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub rate limit reached, try again in a while")
    }

    if (!response.ok) {
      throw new Error(`GitHub returned HTTP ${response.status}`)
    }

    const tree: { tree: GitTreeEntry[], truncated: boolean } = JSON.parse(new TextDecoder().decode(response.body))
    if (tree.truncated) {
      throw new Error("Catalog is too large to list in one request")
    }

    const prefix = `${entry.path.replace(/\/+$/, "")}/`
    return tree.tree
      .filter((item) => item.type === "blob" && item.path.startsWith(prefix))
      .map((item) => ({
        path: item.path.slice(prefix.length),
        size: item.size ?? 0,
        executable: item.mode === "100755"
      }))
  }

  /**
   * Files to install, checked against the limits
   */
  private async getInstallFiles(source: CatalogSource, entry: CatalogExtension) {
    let files = entry.files

    if (!files) {
      if (source.type !== CatalogSourceType.GitHub) {
        throw new Error(`${ExtensionCatalog.indexFileName} has no file list, rebuild it with the latest build-index.mjs`)
      }
      files = await this.getFilesFromGitHubTree(source, entry)
    }

    // Hidden files can't be written: the fs scope's `**` doesn't match them on
    // Unix. They are repo leftovers (.gitignore, .DS_Store), never needed to run.
    files = files.filter((file) => (
      file.path !== FileNames.ExtensionSource &&
      !file.path.split("/").some((segment) => segment.startsWith("."))
    ))

    if (!files.some((file) => file.path === FileNames.ExtensionDefinition)) {
      throw new Error(`${entry.id} has no ${FileNames.ExtensionDefinition}`)
    }

    if (files.length > ExtensionCatalog.maxFiles) {
      throw new Error(`Extension has more than ${ExtensionCatalog.maxFiles} files`)
    }

    const totalBytes = files.reduce((total, file) => total + (file.size ?? 0), 0)
    if (totalBytes > ExtensionCatalog.maxTotalBytes) {
      throw new Error(`Extension is larger than ${ExtensionCatalog.maxTotalBytes / 1024 / 1024} MB`)
    }

    const unsafeFile = files.find((file) => !isSafeRelativePath(file.path))
    if (unsafeFile) {
      throw new Error(`Refusing to write ${unsafeFile.path}`)
    }

    return files
  }

  /**
   * Bytes of one file of a catalog extension, for the file preview. Remote
   * files are kept for the session so switching back doesn't download again.
   */
  async readCatalogFile(entry: CatalogExtension, file: CatalogExtensionFile) {
    const source = this.getSource(entry.sourceId)
    if (!source) {
      throw new Error("Its catalog source was removed")
    }

    const cacheKey = `${entry.sourceId}:${entry.path}/${file.path}`
    const cached = this.previewCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const bytes = await this.readSourceFile(source, entry, file)
    if (source.type !== CatalogSourceType.Local) {
      this.previewCache.set(cacheKey, bytes)
    }
    return bytes
  }

  /**
   * Bytes of one file inside an installed extension's folder
   */
  async readInstalledFile(folderPath: string, filePath: string) {
    return await readFile(await fileService.resolveFilePath(folderPath, ...filePath.split("/")))
  }

  /**
   * Bytes of one file, downloaded from a remote source or read from a local one
   */
  private async readSourceFile(source: CatalogSource, entry: CatalogExtension, file: CatalogExtensionFile) {
    if (source.type === CatalogSourceType.Local) {
      return await readFile(await fileService.resolveFilePath(entry.path, ...file.path.split("/")))
    }

    const encodedPath = [...entry.path.split("/"), ...file.path.split("/")].map(encodeURIComponent).join("/")
    const response = await httpRequest(getCatalogBaseUrl(source) + encodedPath, { method: "GET" })

    if (!response.ok) {
      throw new Error(`Failed to download ${file.path} (HTTP ${response.status})`)
    }

    return new Uint8Array(response.body)
  }

  /**
   * Install or update an extension into a folder named by its source, so the
   * same tool ID from two catalogs can sit side by side. Files are written
   * into a staging folder first and moved into place at the end, so a failure
   * never leaves a half-installed extension behind.
   */
  async install(entry: CatalogExtension) {
    if (!isRunningInTauri) {
      throw new Error("Installing extensions needs the desktop app")
    }

    const source = this.getSource(entry.sourceId)
    if (!source) {
      throw new Error("Its catalog source was removed")
    }

    if (!isSafeRelativePath(entry.id) || entry.id.includes("/")) {
      throw new Error(`Invalid extension ID "${entry.id}"`)
    }

    const sourceKey = getCatalogSourceKey(source)
    const extensionId = getExtensionId(sourceKey, entry.id)
    const folderName = getExtensionFolderName(sourceKey, entry.id)

    if (this.getStatus(entry) === "conflict") {
      throw new Error(`A folder named ${folderName} already exists and wasn't installed from this source`)
    }

    if (this.isInstalling(extensionId)) {
      return
    }

    // Installed before folders were named by source, removed once replaced
    const previousInstall = this.getInstalled(entry)

    this.setInstalling(extensionId, true)
    let tempPath: string | undefined

    try {
      await appDataService.prepareExtensionsFolder()
      tempPath = await fileService.resolveFilePathInAppData(Folders.ExtensionInstalls, folderName)
      const targetPath = await fileService.resolveFilePathInAppData(Folders.Extensions, folderName)
      const files = await this.getInstallFiles(source, entry)

      if (await exists(tempPath)) {
        await remove(tempPath, { recursive: true })
      }
      await mkdir(tempPath, { recursive: true })

      for (let index = 0; index < files.length; index += DOWNLOAD_CONCURRENCY) {
        const folderPath = tempPath
        await Promise.all(files.slice(index, index + DOWNLOAD_CONCURRENCY).map(async(file) => {
          const data = await this.readSourceFile(source, entry, file)

          const segments = file.path.split("/")
          if (segments.length > 1) {
            await mkdir(await fileService.resolveFilePath(folderPath, ...segments.slice(0, -1)), { recursive: true })
          }

          // Keep the executable bit, so a bundled binary can be run directly
          await writeFile(await fileService.resolveFilePath(folderPath, ...segments), data, {
            mode: file.executable ? 0o755 : 0o644
          })
        }))
      }

      const extensionSource: ExtensionSource = {
        catalog: getCatalogSourceLabel(source),
        sourceId: source.id,
        sourceKey,
        id: entry.id,
        version: entry.version,
        installedAt: Date.now()
      }
      await writeTextFile(
        await fileService.resolveFilePath(tempPath, FileNames.ExtensionSource),
        JSON.stringify(extensionSource, undefined, 2)
      )

      if (await exists(targetPath)) {
        await remove(targetPath, { recursive: true })
      }
      await rename(tempPath, targetPath)

      if (previousInstall && previousInstall.folderPath !== targetPath) {
        await remove(previousInstall.folderPath, { recursive: true }).catch(() => {})
      }
    } catch (exception) {
      if (tempPath) {
        await remove(tempPath, { recursive: true }).catch(() => {})
      }
      throw exception
    } finally {
      this.setInstalling(extensionId, false)
    }

    await appletStore.reloadExtensions()
  }
}

export const extensionCatalogService = new ExtensionCatalogService()
