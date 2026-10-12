import { remove } from "@tauri-apps/plugin-fs"
import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { ExtensionCatalog } from "src/constants/extension-catalog"
import { FileNames } from "src/constants/file-names"
import { Folders } from "src/constants/folders.js"
import { AppletType } from "src/enums/applet-type"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { type AppletConstructor } from "src/models/AppletConstructor.js"
import { type CatalogSource } from "src/types/CatalogSource"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type ExtensionSource } from "src/types/ExtensionSource"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type InstalledExtension, type InstalledExtensionTool } from "src/types/InstalledExtension"
import { type LoadedExtensionComponent } from "src/types/LoadedExtensionComponent"
import { getCatalogSourceKey } from "src/utils/get-catalog-source-key"
import { getExtensionComponentKey } from "src/utils/get-extension-component-key"
import { getExtensionId } from "src/utils/get-extension-id"
import { getExtensionToolAppletId } from "src/utils/get-extension-tool-applet-id"
import { loadExtensionComponentHtml } from "src/utils/load-extension-component-html"
import { readExtensionComponents } from "src/utils/read-extension-components"
import { readExtensionTools } from "src/utils/read-extension-tools"
import { resolveExtensionToolComponents } from "src/utils/resolve-extension-tool-components"

import { appDataService } from "./app-data-service.js"
import { extensionComponentRegistry } from "./extension-component-registry.tsx"
import { fileService } from "./file-service.js"
import { userSettingsService } from "./user-settings-service.js"

class ExtensionsService {
  /**
   * Every folder in the extensions folder, including ones that failed to load
   * and ones that are disabled
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

      metadata.entryFile = await fileService.resolveFilePath(path, extension.javascript.entry)
    } else if (extension.runtime === ExtensionRuntime.Executable) {
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
   * instead of thrown so the folder still shows up on the extensions page
   */
  private async readExtension(folderName: string): Promise<InstalledExtension> {
    const folderPath = await fileService.resolveFilePathInAppData(Folders.Extensions, folderName)
    const installedExtension: InstalledExtension = {
      id: getExtensionId(undefined, folderName),
      folderName,
      folderPath,
      tools: [],
      components: []
    }

    try {
      const entries = await fileService.readDirectoryInAppData(folderPath)

      if (!entries.some((entry) => entry.name === FileNames.ExtensionDefinition)) {
        throw new Error(`${FileNames.ExtensionDefinition} is missing`)
      }

      if (entries.some((entry) => entry.name === FileNames.ExtensionSource)) {
        try {
          const sourcePath = await fileService.resolveFilePath(folderPath, FileNames.ExtensionSource)
          const source: ExtensionSource = JSON.parse(await fileService.readFileAsText(sourcePath))

          if (source.id) {
            installedExtension.source = source
            installedExtension.sourceKey = source.sourceKey ?? this.getLegacySourceKey(source)
            installedExtension.id = getExtensionId(installedExtension.sourceKey, source.id)
          }
        } catch {
          // A broken source file makes it a hand-added folder, nothing else
        }
      }

      const manifestPath = await fileService.resolveFilePath(folderPath, FileNames.ExtensionDefinition)
      const manifest: ExtensionManifest = JSON.parse(await fileService.readFileAsText(manifestPath))
      installedExtension.manifest = manifest

      const readText = async(path: string) => await fileService.readFileAsText(path)

      // Built into local lists first, so one broken tool or component fails them all
      const componentFiles = await readExtensionComponents(manifest, folderPath, readText)
      const components: LoadedExtensionComponent[] = []
      for (const componentFile of componentFiles) {
        components.push({
          ...componentFile,
          key: getExtensionComponentKey(installedExtension.id, componentFile.definition.componentId),
          html: await loadExtensionComponentHtml(componentFile, readText)
        })
      }

      const tools: InstalledExtensionTool[] = []
      const toolFiles = await readExtensionTools(manifest, folderPath, readText)
      for (const { definition, path, folderPath: toolFolderPath } of toolFiles) {
        const appletId = getExtensionToolAppletId(installedExtension.id, manifest, definition.toolId)
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
   * Read every folder in the extensions folder, and return the tools of the
   * enabled ones that loaded
   *
   * @returns
   */
  async getExtensionsAsAppletContructor() {
    const extensionEntries = await appDataService.readExtensionsFolder()

    /**
     * Return if there are no extension entries
     */
    if (!extensionEntries) {
      this.setInstalledExtensions([])
      return []
    }

    const installedExtensions = await Promise.all(
      extensionEntries
        // Hidden folders can't be read through the fs scope on Unix anyway
        .filter((entry) => entry.isDirectory && !entry.name.startsWith("."))
        .map(async(entry) => await this.readExtension(entry.name))
    )

    /**
     * IDs are scoped by source, so only a copied folder can repeat one. The
     * first one wins.
     */
    const folderNameById: Record<string, string> = {}
    installedExtensions.forEach((extension) => {
      if (extension.tools.length === 0) return

      if (folderNameById[extension.id]) {
        extension.error = `Same extension as ${folderNameById[extension.id]}, installed twice`
        extension.tools = []
        extension.components = []
      } else {
        folderNameById[extension.id] = extension.folderName
      }
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
   * Delete the extension folder from disk
   */
  async uninstall(extension: InstalledExtension) {
    await remove(extension.folderPath, { recursive: true })
    this.setEnabled(extension, true)
  }
}

export const extensionsService = new ExtensionsService()
