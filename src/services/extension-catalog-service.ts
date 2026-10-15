import { homeDir } from "@tauri-apps/api/path"
import { exists, mkdir, readDir, readFile, remove, rename, stat, writeFile, writeTextFile } from "@tauri-apps/plugin-fs"
import localforage from "localforage"
import { makeAutoObservable } from "mobx"

import { ExtensionCatalog } from "src/constants/extension-catalog"
import { FileNames } from "src/constants/file-names"
import { Folders } from "src/constants/folders"
import { StorageKeys } from "src/constants/storage-keys"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { type CatalogCache } from "src/types/CatalogCache"
import { type CatalogExtension, type CatalogExtensionFile, type CatalogIndexEntry } from "src/types/CatalogExtension"
import { type CatalogSource } from "src/types/CatalogSource"
import { type ExtensionSource } from "src/types/ExtensionSource"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { compareVersions } from "src/utils/catalog/compare-versions"
import { getCatalogBaseUrl } from "src/utils/catalog/get-catalog-base-url"
import { getCatalogFilesSignature } from "src/utils/catalog/get-catalog-files-signature"
import { getCatalogSourceKey } from "src/utils/catalog/get-catalog-source-key"
import { getCatalogSourceLabel } from "src/utils/catalog/get-catalog-source-label"
import { listCatalogRepoFiles } from "src/utils/catalog/list-catalog-repo-files"
import { readCatalogExtension } from "src/utils/catalog/read-catalog-extension"
import { resolveLocalSourceFolder } from "src/utils/catalog/resolve-local-source-folder"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { createLocalExtensionFolderReader } from "src/utils/extension/create-local-extension-folder-reader"
import { createRemoteExtensionFolderReader } from "src/utils/extension/create-remote-extension-folder-reader"
import { getExtensionId } from "src/utils/extension/extension-ids"
import { getExtensionFolderName } from "src/utils/extension/get-extension-folder-name"
import { isSafeRelativePath } from "src/utils/extension/is-safe-relative-path"
import { parseBrowserExtensionPath } from "src/utils/extension/parse-browser-extension-path"
import { readExtensionFileBytes } from "src/utils/extension/read-extension-file-bytes"
import { resolveExtensionPath } from "src/utils/extension/resolve-extension-path"

import { appDataService } from "./app-data-service.js"
import { appletStore } from "./applet-store.js"
import { type BrowserExtensionFileData, browserExtensionStore } from "./browser-extension-store.js"
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

  /**
   * When the extensions were last read from the source, from the cache until
   * it's read again
   */
  updatedAt?: number
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

  /**
   * Listings of remote sources kept between sessions, see `CatalogCache`
   */
  private catalogCache: CatalogCache = {}

  private readonly catalogCacheReady: Promise<void>

  constructor() {
    makeAutoObservable<this, "previewCache" | "catalogCache" | "catalogCacheReady">(this, {
      previewCache: false,
      catalogCache: false,
      catalogCacheReady: false
    })
    userSettingsService.watchStore(this)
    this.catalogCacheReady = this.restoreCatalogCache()
  }

  private async restoreCatalogCache() {
    try {
      const cache = await localforage.getItem<CatalogCache>(StorageKeys.ExtensionCatalogCache)
      if (cache) {
        this.catalogCache = cache
      }
    } catch {
      // Without a cache every source is read again, nothing else is lost
    }
  }

  /**
   * Keep what a source listed, dropping sources that were since removed
   */
  private saveCatalogCache(source: CatalogSource, updatedAt: number, extensions: CatalogExtension[]) {
    const sourceKeys = new Set(this.sources.map(getCatalogSourceKey))
    const kept = Object.entries(this.catalogCache).filter(([key]) => sourceKeys.has(key))

    this.catalogCache = {
      ...Object.fromEntries(kept),
      [getCatalogSourceKey(source)]: {
        updatedAt,
        extensions: extensions.map(({ sourceId: _sourceId, ...entry }): CatalogIndexEntry => entry)
      }
    }

    void localforage.setItem(StorageKeys.ExtensionCatalogCache, this.catalogCache).catch(() => {})
  }

  get sources(): CatalogSource[] {
    // Index URL sources added before they were dropped are left out
    const knownTypes: string[] = Object.values(CatalogSourceType)
    return [ExtensionCatalog.defaultSource, ...this.customSources.filter((source) => knownTypes.includes(source.type))]
  }

  get enabledSources() {
    return this.sources.filter((source) => this.isSourceEnabled(source.id))
  }

  /**
   * Enabled sources listed in Discover. Local ones aren't: their extensions
   * are loaded in place and show as installed.
   */
  get remoteSources() {
    return this.enabledSources.filter((source) => source.type !== CatalogSourceType.Local)
  }

  get isLoading() {
    return this.remoteSources.some((source) => this.sourceStates[source.id]?.isLoading)
  }

  get isLoaded() {
    return this.remoteSources.every((source) => this.sourceStates[source.id]?.isLoaded)
  }

  /**
   * When the least recently read source was last read, undefined until one
   * has been read. Sources that never loaded don't count, their error shows.
   */
  get updatedAt() {
    const times = this.remoteSources
      .map((source) => this.sourceStates[source.id]?.updatedAt)
      .filter((time): time is number => time !== undefined)

    return times.length > 0 ? Math.min(...times) : undefined
  }

  /**
   * Sources that failed to load, with the reason
   */
  get failedSources() {
    return this.remoteSources
      .map((source) => ({ source, error: this.sourceStates[source.id]?.error }))
      .filter((item): item is { source: CatalogSource, error: string } => !!item.error)
  }

  /**
   * Extensions of every enabled source, the same ID can be listed by more
   * than one source
   */
  get catalogExtensions(): CatalogExtension[] {
    return this.remoteSources
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
    if (source?.type === CatalogSourceType.Local) {
      // Its extensions come and go from Installed
      void appletStore.reloadExtensions()
    } else if (enabled && source) {
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
    const updatedAt = Date.now()

    this.addCustomSource(newSource)
    this.setSourceState(newSource.id, { isLoading: false, isLoaded: true, extensions, updatedAt })

    if (newSource.type !== CatalogSourceType.Local) {
      this.saveCatalogCache(newSource, updatedAt, extensions)
    }

    if (newSource.type === CatalogSourceType.Local) {
      await appletStore.reloadExtensions()
    }

    return extensions.length
  }

  private addCustomSource(source: CatalogSource) {
    this.customSources = [...this.customSources, source]
  }

  removeSource(sourceId: string) {
    if (sourceId === ExtensionCatalog.defaultSource.id) {
      return
    }

    const isLocal = this.getSource(sourceId)?.type === CatalogSourceType.Local

    this.customSources = this.customSources.filter((source) => source.id !== sourceId)
    this.disabledSourceIds = this.disabledSourceIds.filter((id) => id !== sourceId)

    const { [sourceId]: _removed, ...sourceStates } = this.sourceStates
    this.sourceStates = sourceStates

    if (isLocal) {
      void appletStore.reloadExtensions()
    }
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
   * Load every enabled source. A cached listing is shown right away and read
   * again only once it's older than `cacheMaxAgeMs`, or when forced.
   */
  async loadCatalog(force = false) {
    await Promise.all(this.remoteSources.map(async(source) => { await this.loadSource(source, force) }))
  }

  /**
   * Read a source again now: a remote one from its host, a local one by
   * reloading every extension, since linked folders load with the rest
   */
  async refreshSource(source: CatalogSource) {
    if (source.type === CatalogSourceType.Local) {
      await appletStore.reloadExtensions()
      return
    }

    await this.loadSource(source, true)
  }

  /**
   * Read every enabled source again now
   */
  async refreshAllSources() {
    const hasLocal = this.enabledSources.some((source) => source.type === CatalogSourceType.Local)

    await Promise.all([
      this.loadCatalog(true),
      hasLocal ? appletStore.reloadExtensions() : undefined
    ])
  }

  async loadSource(source: CatalogSource, force = false) {
    await this.catalogCacheReady

    const state = this.sourceStates[source.id]
    if (state?.isLoading || (state?.isLoaded && !force)) {
      return
    }

    const cached = this.catalogCache[getCatalogSourceKey(source)]
    const cachedExtensions = (cached?.extensions ?? []).map((entry) => ({ ...entry, sourceId: source.id }))

    if (cached && !state?.isLoaded) {
      this.setSourceState(source.id, { isLoaded: true, extensions: cachedExtensions, updatedAt: cached.updatedAt })

      if (!force && Date.now() - cached.updatedAt < ExtensionCatalog.cacheMaxAgeMs) {
        return
      }
    }

    this.setSourceState(source.id, { isLoading: true })

    try {
      // Unchanged extensions are taken from what's shown, so they aren't downloaded again
      const previous = this.sourceStates[source.id]?.extensions ?? cachedExtensions
      const extensions = await this.fetchSourceExtensions(source, force, previous)
      const updatedAt = Date.now()

      this.setSourceState(source.id, { isLoading: false, isLoaded: true, error: undefined, extensions, updatedAt })
      this.saveCatalogCache(source, updatedAt, extensions)
    } catch (exception) {
      // What was shown stays, with the error next to it
      const message = getErrorMessage(exception)
      this.setSourceState(source.id, { isLoading: false, isLoaded: true, error: message })
    }
  }

  private async fetchSourceExtensions(
    source: CatalogSource,
    bustCache: boolean,
    previous: CatalogExtension[] = []
  ): Promise<CatalogExtension[]> {
    switch (source.type) {
    case CatalogSourceType.Local:
      return await this.readLocalSource(source)
    case CatalogSourceType.GitHub:
    case CatalogSourceType.GitLab:
    case CatalogSourceType.Gitea:
      return await this.readRepoSource(source, bustCache, previous)
    }
  }

  /**
   * A repo lists its files through the host's API, then each extension's
   * `peranti.json` and definition files are downloaded as they are. Nothing
   * has to be generated in the repo. Extensions sit in its `extensions`
   * folder when it has one, otherwise at its root. An extension whose files
   * all have the same hashes as in `previous` is taken from there as is.
   */
  private async readRepoSource(
    source: CatalogSource,
    bustCache: boolean,
    previous: CatalogExtension[]
  ): Promise<CatalogExtension[]> {
    const repoFiles = await listCatalogRepoFiles(source)
    const extensionsFolder = `${ExtensionCatalog.extensionsFolderName}/`
    const prefix = repoFiles.some((file) => file.path.startsWith(extensionsFolder)) ? extensionsFolder : ""

    const filesById = new Map<string, CatalogExtensionFile[]>()
    for (const file of repoFiles) {
      if (!file.path.startsWith(prefix)) continue

      const [id, ...rest] = file.path.slice(prefix.length).split("/")
      if (rest.length === 0 || id.startsWith(".")) continue

      filesById.set(id, [...(filesById.get(id) ?? []), { ...file, path: rest.join("/") }])
    }

    const baseUrl = getCatalogBaseUrl(source)
    const extensions = await Promise.all(Array.from(filesById.entries())
      .filter(([, files]) => files.some((file) => file.path === FileNames.ExtensionDefinition))
      .map(async([id, files]) => {
        const path = prefix + id
        const signature = getCatalogFilesSignature(files)
        const unchanged = signature && previous.find((entry) => (
          entry.id === id && entry.path === path && getCatalogFilesSignature(entry.files) === signature
        ))
        if (unchanged) {
          return { ...unchanged, files, sourceId: source.id }
        }

        const folder = createRemoteExtensionFolderReader(baseUrl, path, files.map((file) => file.path), bustCache)

        try {
          return await readCatalogExtension(id, path, folder, files, source.id)
        } catch (exception) {
          // A broken extension only hides itself from the list
          console.warn(`Catalog extension ${path} skipped:`, exception)
          return undefined
        }
      }))

    return extensions.filter((entry): entry is CatalogExtension => !!entry)
  }

  /**
   * Every file under `folderPath`, relative to it, skipping hidden files and
   * the install record
   */
  async listFolderFiles(folderPath: string): Promise<CatalogExtensionFile[]> {
    const browserPath = parseBrowserExtensionPath(folderPath)
    if (browserPath) {
      const browserFiles = await browserExtensionStore.listFiles(browserPath.folderName)
      return browserFiles.filter((file) => !IGNORED_FILE_NAMES.has(file.path))
    }

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
   * `extensions` folder when it has one, so no index has to be built. Only
   * checks a source being added, its extensions are loaded in place.
   */
  private async readLocalSource(source: CatalogSource): Promise<CatalogExtension[]> {
    if (!isRunningInTauri) {
      throw new Error("Local folders need the desktop app")
    }

    const extensionsFolder = await resolveLocalSourceFolder(source.location)
    const extensions: CatalogExtension[] = []

    for (const entry of await readDir(extensionsFolder)) {
      if (!entry.isDirectory || entry.name.startsWith(".")) continue

      const folderPath = await fileService.resolveFilePath(extensionsFolder, entry.name)
      const manifestPath = await fileService.resolveFilePath(folderPath, FileNames.ExtensionDefinition)
      if (!(await exists(manifestPath))) continue

      try {
        const folder = await createLocalExtensionFolderReader(folderPath)
        extensions.push(await readCatalogExtension(entry.name, folderPath, folder, await this.listFolderFiles(folderPath), source.id))
      } catch (exception) {
        // A broken manifest only hides that one folder from the list
        console.warn(`Extension folder ${folderPath} skipped:`, exception)
      }
    }

    return extensions
  }

  /**
   * Files to install, checked against the limits
   */
  private getInstallFiles(entry: CatalogExtension) {
    // Hidden files can't be written: the fs scope's `**` doesn't match them on
    // Unix. They are repo leftovers (.gitignore, .DS_Store), never needed to run.
    const files = entry.files.filter((file) => (
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
    return await readExtensionFileBytes(await resolveExtensionPath(folderPath, filePath))
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
    if (!isRunningInTauri && this.needsDesktopApp(entry)) {
      throw new Error("Executable tools need the desktop app")
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

    const extensionSource: ExtensionSource = {
      catalog: getCatalogSourceLabel(source),
      sourceId: source.id,
      sourceKey,
      id: entry.id,
      version: entry.version,
      installedAt: Date.now()
    }

    if (!isRunningInTauri) {
      this.setInstalling(extensionId, true)
      try {
        await this.installInBrowser(source, entry, folderName, extensionSource)

        if (previousInstall && previousInstall.folderName !== folderName) {
          await browserExtensionStore.removeFolder(previousInstall.folderName).catch(() => {})
        }
      } finally {
        this.setInstalling(extensionId, false)
      }

      await appletStore.reloadExtensions()
      return
    }

    this.setInstalling(extensionId, true)
    let tempPath: string | undefined

    try {
      await appDataService.prepareExtensionsFolder()
      tempPath = await fileService.resolveFilePathInAppData(Folders.ExtensionInstalls, folderName)
      const targetPath = await fileService.resolveFilePathInAppData(Folders.Extensions, folderName)
      const files = this.getInstallFiles(entry)

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

  /**
   * Whether `entry` has a tool only the desktop app can run
   */
  needsDesktopApp(entry: CatalogExtension) {
    return entry.tools.some((tool) => tool.runtime === ExtensionRuntime.Executable)
  }

  /**
   * Install into the browser's storage: every file is downloaded first, so a
   * failed download leaves the installed version as it was
   */
  private async installInBrowser(
    source: CatalogSource,
    entry: CatalogExtension,
    folderName: string,
    extensionSource: ExtensionSource
  ) {
    const files = this.getInstallFiles(entry)
    const downloaded: BrowserExtensionFileData[] = []

    for (let index = 0; index < files.length; index += DOWNLOAD_CONCURRENCY) {
      downloaded.push(...await Promise.all(files.slice(index, index + DOWNLOAD_CONCURRENCY).map(async(file) => ({
        path: file.path,
        bytes: await this.readSourceFile(source, entry, file)
      }))))
    }

    downloaded.push({
      path: FileNames.ExtensionSource,
      bytes: new TextEncoder().encode(JSON.stringify(extensionSource, undefined, 2))
    })

    await browserExtensionStore.writeFolder(folderName, downloaded)
  }
}

export const extensionCatalogService = new ExtensionCatalogService()
