import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { EXTENSIONS_CATEGORY, ExtensionCatalog } from "src/constants/extension-catalog"
import { FileNames } from "src/constants/file-names"
import { AppletType } from "src/enums/applet-type"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { type AppletConstructor } from "src/models/AppletConstructor.js"
import { type CatalogSource } from "src/types/CatalogSource"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type ExtensionSource } from "src/types/ExtensionSource"
import { type ExtensionFolder } from "src/types/ExtensionStorage"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type InstalledExtension, type InstalledExtensionTool } from "src/types/InstalledExtension"
import { type LoadedExtensionComponent } from "src/types/LoadedExtensionComponent"
import { getCatalogSourceKey, getUnknownSourceKey } from "src/utils/catalog/catalog-sources"
import { listLocalSourceFolders } from "src/utils/catalog/local-source-folders"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { loadExtensionComponentHtml } from "src/utils/extension/extension-component-document"
import { readExtensionComponents, readExtensionTools, resolveExtensionToolComponents } from "src/utils/extension/extension-definitions"
import { createExtensionFolderReader } from "src/utils/extension/extension-folder-readers"
import { getExtensionComponentKey, getExtensionId, getExtensionToolAppletId } from "src/utils/extension/extension-ids"
import { joinRelativePaths } from "src/utils/extension/extension-paths"
import { pluralize } from "src/utils/text/pluralize"

import { extensionComponentRegistry } from "./extension-component-registry.tsx"
import { extensionStorage, resolveDiskPath } from "./extension-storage/index.js"
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
    return catalogSource ? getCatalogSourceKey(catalogSource) : getUnknownSourceKey(source.sourceId)
  }

  private setInstalledExtensions(installedExtensions: InstalledExtension[]) {
    this.installedExtensions = installedExtensions
    this.isLoaded = true
  }

  /**
   * Builds the applet constructor of one tool of an extension
   *
   * @param toolFolder Folder of the tool's definition, relative to the extension
   */
  private async buildAppletConstructor(appletId: string, folder: ExtensionFolder, toolFolder: string, tool: ExtensionTool) {
    if (!tool.toolId) {
      throw new Error("\"toolId\" is required")
    }

    // Errors name the tool, so a package says which of its tools is wrong
    const prefix = `${tool.toolId}: `
    const metadata: ExtensionMetadata = { runtime: tool.runtime, folder }

    if (tool.runtime === ExtensionRuntime.JavaScript) {
      if (!tool.javascript?.entry) {
        throw new Error(`${prefix}"javascript.entry" is required for the javascript runtime`)
      }

      metadata.entryFile = joinRelativePaths(toolFolder, tool.javascript.entry)
    } else if (tool.runtime === ExtensionRuntime.Executable) {
      if (!folder.diskPath) {
        throw new Error(`${prefix}the executable runtime needs the desktop app`)
      }

      if (!tool.executable?.command) {
        throw new Error(`${prefix}"executable.command" is required for the executable runtime`)
      }

      metadata.executable = tool.executable
      metadata.workingDirectory = await resolveDiskPath(folder.diskPath, toolFolder)
    } else {
      throw new Error(`${prefix}"runtime" must be "${ExtensionRuntime.JavaScript}" or "${ExtensionRuntime.Executable}"`)
    }

    const appletConstructor: AppletConstructor = {
      appletId,
      name: tool.name,
      description: tool.description,
      category: tool.category ?? EXTENSIONS_CATEGORY,
      inputFields: tool.inputFields,
      outputFields: tool.outputFields,
      layoutSetting: tool.layoutSetting,
      autoRun: tool.autoRun,
      type: AppletType.Extension,
      presets: tool.presets,
      disableMultipleSession: tool.disableMultipleSession,
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
  private async readExtension(extensionFolder: ExtensionFolder, linkedSource?: CatalogSource): Promise<InstalledExtension> {
    const linkedSourceKey = linkedSource && getCatalogSourceKey(linkedSource)
    const installedExtension: InstalledExtension = {
      id: getExtensionId(linkedSourceKey, extensionFolder.name),
      sourceKey: linkedSourceKey,
      linkedSourceId: linkedSource?.id,
      folderName: extensionFolder.name,
      folder: extensionFolder,
      tools: [],
      components: []
    }

    try {
      const folder = await createExtensionFolderReader(extensionFolder)

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
          extensionFolder,
          key: getExtensionComponentKey(installedExtension.id, componentFile.definition.componentId),
          html: await loadExtensionComponentHtml(componentFile, folder)
        })
      }

      const tools: InstalledExtensionTool[] = []
      const toolFiles = await readExtensionTools(manifest, folder)
      for (const { definition, path, folder: toolFolder } of toolFiles) {
        const appletId = getExtensionToolAppletId(installedExtension.id, definition.toolId)
        const resolvedDefinition = resolveExtensionToolComponents(definition, componentFiles, installedExtension.id)

        tools.push({
          definition,
          path,
          appletConstructor: await this.buildAppletConstructor(appletId, extensionFolder, toolFolder, resolvedDefinition)
        })
      }

      installedExtension.components = components
      installedExtension.tools = tools
    } catch (exception) {
      installedExtension.error = getErrorMessage(exception)
    }

    return installedExtension
  }

  /**
   * Every installed extension, in the extensions folder or the browser
   */
  private async readInstalledExtensions() {
    const folders = await extensionStorage.listFolders()
    return await Promise.all(folders.map(async(folder) => await this.readExtension(folder)))
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
        const folders = await listLocalSourceFolders(source)
        return await Promise.all(folders.map(async(folder) => await this.readExtension(folder, source)))
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
    // Linked folders last, so a copy installed from a local source wins
    const installedExtensions = [...await this.readInstalledExtensions(), ...await this.readLinkedExtensions()]

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
      toast.error(`${pluralize(failedCount, "extension")} failed to load, see the Extensions page`, {
        id: "extensions-failed"
      })
    }

    // Before the tools are listed, so their fields find their components
    extensionComponentRegistry.setComponents(this.loadedExtensions.flatMap((extension) => extension.components))

    return this.loadedTools.map((tool) => tool.appletConstructor)
  }

  async openExtensionsFolder() {
    await extensionStorage.revealRoot?.()
  }

  /**
   * Delete the extension's folder. A linked folder is never deleted,
   * it belongs to its source.
   */
  async uninstall(extension: InstalledExtension) {
    if (extension.linkedSourceId) {
      throw new Error("Linked from a local source, turn the source off instead")
    }

    await extensionStorage.removeFolder(extension.folderName)
    this.setEnabled(extension, true)
  }
}

export const extensionsService = new ExtensionsService()
