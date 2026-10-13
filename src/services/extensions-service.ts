import { readDir, remove } from "@tauri-apps/plugin-fs"
import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { ExtensionCatalog } from "src/constants/extension-catalog"
import { FileNames } from "src/constants/file-names"
import { Folders } from "src/constants/folders.js"
import { AppletType } from "src/enums/applet-type"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { type AppletConstructor } from "src/models/AppletConstructor.js"
import { type CatalogSource } from "src/types/CatalogSource"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type ExtensionSource } from "src/types/ExtensionSource"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type InstalledExtension, type InstalledExtensionTool } from "src/types/InstalledExtension"
import { type LoadedExtensionComponent } from "src/types/LoadedExtensionComponent"
import { getCatalogSourceKey } from "src/utils/catalog/get-catalog-source-key"
import { resolveLocalSourceFolder } from "src/utils/catalog/resolve-local-source-folder"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { createBrowserExtensionFolderReader } from "src/utils/extension/create-browser-extension-folder-reader"
import { createLocalExtensionFolderReader } from "src/utils/extension/create-local-extension-folder-reader"
import { getBrowserExtensionPath } from "src/utils/extension/get-browser-extension-path"
import { getExtensionComponentKey } from "src/utils/extension/get-extension-component-key"
import { getExtensionId } from "src/utils/extension/get-extension-id"
import { getExtensionToolAppletId } from "src/utils/extension/get-extension-tool-applet-id"
import { loadExtensionComponentHtml } from "src/utils/extension/load-extension-component-html"
import { parseBrowserExtensionPath } from "src/utils/extension/parse-browser-extension-path"
import { readExtensionComponents } from "src/utils/extension/read-extension-components"
import { readExtensionTools } from "src/utils/extension/read-extension-tools"
import { resolveExtensionPath } from "src/utils/extension/resolve-extension-path"
import { resolveExtensionToolComponents } from "src/utils/extension/resolve-extension-tool-components"

import { appDataService } from "./app-data-service.js"
import { browserExtensionStore } from "./browser-extension-store.js"
import { extensionComponentRegistry } from "./extension-component-registry.tsx"
import { fileService } from "./file-service.js"
import { userSettingsService } from "./user-settings-service.js"

class ExtensionsService {
  /**
   * Every folder in the extensions folder and in enabled local sources,
   * including ones that failed to load and ones that are disabled
   */
  installedExtensions: InstalledExtension[] = []

  /**
   * IDs of extensions the user turned off, their tools are not loaded. Can
   * still hold folder names, saved before extension IDs were scoped by source.
   */
  @userSettingsService.watch(UserSettingsKeys.extensionsDisabled)
  disabledIds: string[] = userSettingsService.get(
    UserSettingsKeys.extensionsDisabled,
    []
  )

  /**
   * Whether the extensions folder has been read at least once
   */
  isLoaded: boolean = false

  /**
   * Constructor
   */
  constructor() {
    makeAutoObservable(this)
    userSettingsService.watchStore(this)
  }

  /**
   * Extensions that loaded and are enabled
   */
  get loadedExtensions() {
    return this.installedExtensions.filter((extension) => (
      extension.tools.length > 0 && this.isEnabled(extension)
    ))
  }

  /**
   * Tools of every loaded and enabled extension
   */
  get loadedTools() {
    return this.loadedExtensions.flatMap((extension) => extension.tools)
  }

  isEnabled(extension: InstalledExtension) {
    return !this.disabledIds.includes(extension.id) && !this.disabledIds.includes(extension.folderName)
  }

  setEnabled(extension: InstalledExtension, enabled: boolean) {
    const disabledIds = this.disabledIds.filter((id) => id !== extension.id && id !== extension.folderName)

    this.disabledIds = enabled
      ? disabledIds
      : [...disabledIds, extension.id]
  }

  /**
   * Source key of an extension installed before keys were saved with it,
   * looked up from the source ID it was installed from
   */
  private getLegacySourceKey(source: ExtensionSource) {
    if (!source.sourceId || source.sourceId === ExtensionCatalog.defaultSource.id) {
      return getCatalogSourceKey(ExtensionCatalog.defaultSource)
    }

    const customSources: CatalogSource[] = userSettingsService.get(UserSettingsKeys.extensionsCatalogSources, [])
    const catalogSource = customSources.find((item) => item.id === source.sourceId)

    // A removed source can't be looked up, its ID still keeps it apart
    return catalogSource ? getCatalogSourceKey(catalogSource) : `unknown:${source.sourceId}`
  }

  private setInstalledExtensions(installedExtensions: InstalledExtension[]) {
    this.installedExtensions = installedExtensions
    this.isLoaded = true
  }

  /**
   * Build Applet Constructor from one tool of an extension
   */
  private async buildAppletConstructor(appletId: string, path: string, extension: ExtensionTool) {
    // Errors name the tool, so a package says which of its tools is wrong
    const prefix = extension.toolId ? `${extension.toolId}: ` : ""

    if (!extension.toolId) {
      throw new Error("\"toolId\" is required")
    }

    const metadata: ExtensionMetadata = {
      runtime: extension.runtime,
      folderPath: path
    }

    if (extension.runtime === ExtensionRuntime.JavaScript) {
      if (!extension.javascript?.entry) {
        throw new Error(`${prefix}"javascript.entry" is required for the javascript runtime`)
      }

      metadata.entryFile = await resolveExtensionPath(path, extension.javascript.entry)
    } else if (extension.runtime === ExtensionRuntime.Executable) {
      if (!isRunningInTauri) {
        throw new Error(`${prefix}the executable runtime needs the desktop app`)
      }

      if (!extension.executable?.command) {
        throw new Error(`${prefix}"executable.command" is required for the executable runtime`)
      }

      metadata.executable = extension.executable
    } else {
      throw new Error(`${prefix}"runtime" must be "${ExtensionRuntime.JavaScript}" or "${ExtensionRuntime.Executable}"`)
    }

    const appletConstructor: AppletConstructor = {
      appletId,
      name: extension.name,
      description: extension.description,
      category: extension.category ?? "Extensions",
      inputFields: extension.inputFields,
      outputFields: extension.outputFields,
      layoutSetting: extension.layoutSetting,
      autoRun: extension.autoRun,
      type: AppletType.Extension,
      samples: extension.samples,
      disableMultipleSession: extension.disableMultipleSession,
      metadata
    }

    return appletConstructor
  }

  /**
   * Read one extension folder, a failure is kept on the returned entry
   * instead of thrown so the folder still shows up on the extensions page.
   * A folder of a local source is linked: its ID is scoped by that source,
   * the same one a copy installed from it would get.
   */
  private async readExtension(
    folderPath: string,
    folderName: string,
    createFolder: () => Promise<ExtensionFolderReader>,
    linkedSource?: CatalogSource
  ): Promise<InstalledExtension> {
    const linkedSourceKey = linkedSource && getCatalogSourceKey(linkedSource)
    const installedExtension: InstalledExtension = {
      id: getExtensionId(linkedSourceKey, folderName),
      sourceKey: linkedSourceKey,
      linkedSourceId: linkedSource?.id,
      folderName,
      folderPath,
      tools: [],
      components: []
    }

    try {
      const folder = await createFolder()

      if (!folder.filePaths.includes(FileNames.ExtensionDefinition)) {
        throw new Error(`${FileNames.ExtensionDefinition} is missing`)
      }

      // A linked folder is the source itself, never an install record
      if (!linkedSource && folder.filePaths.includes(FileNames.ExtensionSource)) {
        try {
          const source: ExtensionSource = JSON.parse(await folder.readText(FileNames.ExtensionSource))

          if (source.id) {
            installedExtension.source = source
            installedExtension.sourceKey = source.sourceKey ?? this.getLegacySourceKey(source)
            installedExtension.id = getExtensionId(installedExtension.sourceKey, source.id)
          }
        } catch {
          // A broken source file makes it a hand-added folder, nothing else
        }
      }

      const manifest: ExtensionManifest = JSON.parse(await folder.readText(FileNames.ExtensionDefinition))
      installedExtension.manifest = manifest

      // Built into local lists first, so one broken tool or component fails them all
      const componentFiles = await readExtensionComponents(folder)
      const components: LoadedExtensionComponent[] = []
      for (const componentFile of componentFiles) {
        components.push({
          ...componentFile,
          key: getExtensionComponentKey(installedExtension.id, componentFile.definition.componentId),
          html: await loadExtensionComponentHtml(componentFile, folder)
        })
      }

      const tools: InstalledExtensionTool[] = []
      const toolFiles = await readExtensionTools(manifest, folder)
      for (const { definition, path, folderPath: toolFolderPath } of toolFiles) {
        const appletId = getExtensionToolAppletId(installedExtension.id, definition.toolId)
        const resolvedDefinition = resolveExtensionToolComponents(definition, componentFiles, installedExtension.id)

        tools.push({
          definition,
          path,
          appletConstructor: await this.buildAppletConstructor(appletId, toolFolderPath, resolvedDefinition)
        })
      }

      installedExtension.components = components
      installedExtension.tools = tools
    } catch (exception) {
      installedExtension.error = exception instanceof Error ? exception.message : String(exception)
    }

    return installedExtension
  }

  /**
   * Every folder in the extensions folder
   */
  private async readCopiedExtensions() {
    const extensionEntries = await appDataService.readExtensionsFolder() ?? []
    const extensionsFolderPath = await fileService.resolveFilePathInAppData(Folders.Extensions)

    return await Promise.all(
      extensionEntries
        // Hidden folders can't be read through the fs scope on Unix anyway
        .filter((entry) => entry.isDirectory && !entry.name.startsWith("."))
        .map(async(entry) => {
          const folderPath = await fileService.resolveFilePath(extensionsFolderPath, entry.name)
          return await this.readExtension(folderPath, entry.name, async() => await createLocalExtensionFolderReader(folderPath))
        })
    )
  }

  /**
   * Every extension the browser build installed into its storage
   */
  private async readBrowserExtensions() {
    const folderNames = await browserExtensionStore.listFolderNames()

    return await Promise.all(folderNames.map(async(folderName) => await this.readExtension(
      getBrowserExtensionPath(folderName),
      folderName,
      async() => await createBrowserExtensionFolderReader(folderName)
    )))
  }

  /**
   * Extensions of every enabled local source, read where they are. Read from
   * the settings, so a source changed right before a reload is seen.
   */
  private async readLinkedExtensions() {
    if (!isRunningInTauri) {
      return []
    }

    const customSources: CatalogSource[] = userSettingsService.get(UserSettingsKeys.extensionsCatalogSources, [])
    const disabledSourceIds: string[] = userSettingsService.get(UserSettingsKeys.extensionsDisabledCatalogSources, [])
    const localSources = customSources.filter((source) => (
      source.type === CatalogSourceType.Local && !disabledSourceIds.includes(source.id)
    ))

    const perSource = await Promise.all(localSources.map(async(source) => {
      try {
        const extensionsFolder = await resolveLocalSourceFolder(source.location)
        const folders = []

        for (const entry of await readDir(extensionsFolder)) {
          if (!entry.isDirectory || entry.name.startsWith(".")) continue

          const folderPath = await fileService.resolveFilePath(extensionsFolder, entry.name)
          const entries = await readDir(folderPath)

          // Only folders that are extensions, a source can hold other folders
          if (entries.some((item) => item.name === FileNames.ExtensionDefinition)) {
            folders.push({ folderPath, folderName: entry.name })
          }
        }

        return await Promise.all(folders.map(async({ folderPath, folderName }) => (
          await this.readExtension(folderPath, folderName, async() => await createLocalExtensionFolderReader(folderPath), source)
        )))
      } catch {
        // A missing source folder shows its error on the Sources dialog
        return []
      }
    }))

    return perSource.flat()
  }

  /**
   * Read every folder in the extensions folder and in enabled local sources,
   * and return the tools of the enabled ones that loaded
   *
   * @returns
   */
  async getExtensionsAsAppletContructor() {
    const copiedExtensions = isRunningInTauri
      ? await this.readCopiedExtensions()
      : await this.readBrowserExtensions()

    // After the copies, so a copy installed from a local source wins
    const installedExtensions = [...copiedExtensions, ...await this.readLinkedExtensions()]

    /**
     * IDs are scoped by source, so only a copied folder, or a copy of a
     * linked one, can repeat one. The first one wins.
     */
    const folderById: Record<string, InstalledExtension> = {}
    installedExtensions.forEach((extension) => {
      if (extension.tools.length === 0) return

      const first = folderById[extension.id]
      if (!first) {
        folderById[extension.id] = extension
        return
      }

      extension.error = extension.linkedSourceId
        ? `A copy is installed in ${first.folderName}, uninstall it to use this folder in place`
        : `Same extension as ${first.folderName}, installed twice`
      extension.tools = []
      extension.components = []
    })

    installedExtensions.sort((a, b) => (
      (a.manifest?.name ?? a.folderName).localeCompare(b.manifest?.name ?? b.folderName)
    ))

    this.setInstalledExtensions(installedExtensions)

    const failedCount = installedExtensions.filter((extension) => extension.error).length
    if (failedCount > 0) {
      toast.error(`${failedCount} extension${failedCount > 1 ? "s" : ""} failed to load, see the Extensions page`, {
        id: "extensions-failed"
      })
    }

    // Before the tools are listed, so their fields find their components
    extensionComponentRegistry.setComponents(this.loadedExtensions.flatMap((extension) => extension.components))

    return this.loadedTools.map((tool) => tool.appletConstructor)
  }

  async openExtensionsFolder() {
    await appDataService.prepareExtensionsFolder()

    const folderPath = await fileService.resolveFilePathInAppData(Folders.Extensions)
    await fileService.openPathInFileManager(folderPath)
  }

  /**
   * Delete the extension folder from disk. A linked folder is never deleted,
   * it belongs to its source.
   */
  async uninstall(extension: InstalledExtension) {
    if (extension.linkedSourceId) {
      throw new Error("Linked from a local source, turn the source off instead")
    }

    const browserPath = parseBrowserExtensionPath(extension.folderPath)
    if (browserPath) {
      await browserExtensionStore.removeFolder(browserPath.folderName)
    } else {
      await remove(extension.folderPath, { recursive: true })
    }
    this.setEnabled(extension, true)
  }
}

export const extensionsService = new ExtensionsService()
