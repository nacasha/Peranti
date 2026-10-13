import { makeAutoObservable } from "mobx"

import { extensionsApplet } from "src/applets/pages/extensions-applet"
import { historyApplet } from "src/applets/pages/history-applet"
import { pipelineEditorApplet } from "src/applets/pages/pipeline-editor-applet"
import { settingsApplet } from "src/applets/pages/settings-applet"
import { workbenchApplet } from "src/applets/pages/workbench-applet"
import { base64EncodeDecodeTool } from "src/applets/tools/base64-encode-decode-tool"
import { base64ToFileTool } from "src/applets/tools/base64-to-file-tool"
import { characterCounterTool } from "src/applets/tools/character-counter-tool"
import { colorConverterTool } from "src/applets/tools/color-converter-tool"
import { colorExtractTool } from "src/applets/tools/color-extract-tool"
import { colorPalleteGeneratorTool } from "src/applets/tools/color-pallete-generator-tool"
import { colorTintsAndShadesTool } from "src/applets/tools/color-tints-and-shades-tool"
import { compareListTool } from "src/applets/tools/compare-list-tool"
import { cronReadableTool } from "src/applets/tools/cron-readable-tool"
import { csvColumnPickerTool } from "src/applets/tools/csv-column-picker-tool"
import { csvColumnReorderTool } from "src/applets/tools/csv-column-reorder-tool"
import { csvDedupeRowsTool } from "src/applets/tools/csv-dedupe-rows-tool"
import { csvDelimiterConverterTool } from "src/applets/tools/csv-delimiter-converter-tool"
import { csvSortTool } from "src/applets/tools/csv-sort-tool"
import { csvTableViewerTool } from "src/applets/tools/csv-table-viewer-tool"
import { csvToJsonTool } from "src/applets/tools/csv-to-json-tool"
import { csvTransposeTool } from "src/applets/tools/csv-transpose-tool"
import { dateToMillisecondsTool } from "src/applets/tools/date-to-milliseconds"
import { faviconGrabberTool } from "src/applets/tools/favicon-grabber-tool"
import { fileToBase64Tool } from "src/applets/tools/file-to-base-64-tool"
import { generateRandomStringTool } from "src/applets/tools/generate-random-string"
import { generateUuidTool } from "src/applets/tools/generate-uuid-tool"
import { hashTool } from "src/applets/tools/hash-tool"
import { javascriptRunnerTool } from "src/applets/tools/javascript-runner-tool"
import { jsonDiffTool } from "src/applets/tools/json-diff-tool"
import { jsonFormatter } from "src/applets/tools/json-formatter-tool"
import { jsonMergeTool } from "src/applets/tools/json-merge-tool"
import { jsonToCsvTool } from "src/applets/tools/json-to-csv-tool"
import { jsonToTomlTool } from "src/applets/tools/json-to-toml-tool"
import { jsonToYamlTool } from "src/applets/tools/json-to-yaml-tool"
import { jsonTableViewerTool } from "src/applets/tools/json-viewer-tool"
import { jsonataTool } from "src/applets/tools/jsonata-tool"
import { loremIpsumGeneratorTool } from "src/applets/tools/lorem-ipsum-generator-tool"
import { markdownParserTool } from "src/applets/tools/markdown-parser-tool"
import { mathEvaluatorTool } from "src/applets/tools/math-evaluator-tool"
import { mermaidEditorTool } from "src/applets/tools/mermaid-editor-tool"
import { millisecondsToDate } from "src/applets/tools/milliseconds-to-date-tool"
import { pintoraEditorTool } from "src/applets/tools/pintora-editor-tool"
import { prefixSuffixLines } from "src/applets/tools/prefix-suffix-lines-tool"
import { reactRunnerTool } from "src/applets/tools/react-runner-tool"
import { removeDuplicateList } from "src/applets/tools/remove-duplicate-lines-tool"
import { sortList } from "src/applets/tools/sort-list-tool"
import { sqlFormatterTool } from "src/applets/tools/sql-formatter"
import { sqlMinifyTool } from "src/applets/tools/sql-minify"
import { textEditorTool } from "src/applets/tools/text-editor-tool"
import { textEscapeUnescapeTool } from "src/applets/tools/text-escape-unescape-tool"
import { textTransformTool } from "src/applets/tools/text-transform-tool"
import { uriEncodeDecodeTool } from "src/applets/tools/uri-encode-decode-tool"
import { yamlToJsonTool } from "src/applets/tools/yaml-to-json-tool"
import { EXTENSION_PAGE_APPLET_PREFIX } from "src/constants/extension-page"
import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/models/AppletConstructor.ts"
import { type Preset } from "src/types/Preset.ts"
import { mergeAppletConstructorWithPreset } from "src/utils/applet/merge-applet-constructor-with-preset.ts"
import { createExtensionPageApplet } from "src/utils/extension/create-extension-page-applet"

import { commandbarService } from "./commandbar-service.ts"
import { extensionsService } from "./extensions-service.ts"
import { sessionStore } from "./session-store.ts"
import { toolSidebarService } from "./tool-sidebar-service.ts"

/**
 * This AppletStore resposible to load all built-in applets, user applets,
 * and extensions from app data folder. Merge all of them and put into `loaded` state.
 */
class AppletStore {
  /**
   * List of buildit applets
   */
  private readonly builtInApplets: Record<string, AppletConstructor> = {
    /**
     * Applet Tools
     */
    [removeDuplicateList.appletId]: removeDuplicateList,
    [sortList.appletId]: sortList,
    [compareListTool.appletId]: compareListTool,
    [prefixSuffixLines.appletId]: prefixSuffixLines,
    [millisecondsToDate.appletId]: millisecondsToDate,
    [textTransformTool.appletId]: textTransformTool,
    [hashTool.appletId]: hashTool,
    [generateUuidTool.appletId]: generateUuidTool,
    [generateRandomStringTool.appletId]: generateRandomStringTool,
    [jsonFormatter.appletId]: jsonFormatter,
    [jsonMergeTool.appletId]: jsonMergeTool,
    [cronReadableTool.appletId]: cronReadableTool,
    [mathEvaluatorTool.appletId]: mathEvaluatorTool,
    [characterCounterTool.appletId]: characterCounterTool,
    [uriEncodeDecodeTool.appletId]: uriEncodeDecodeTool,
    [base64EncodeDecodeTool.appletId]: base64EncodeDecodeTool,
    [loremIpsumGeneratorTool.appletId]: loremIpsumGeneratorTool,
    [faviconGrabberTool.appletId]: faviconGrabberTool,
    [textEditorTool.appletId]: textEditorTool,
    [jsonDiffTool.appletId]: jsonDiffTool,
    [jsonataTool.appletId]: jsonataTool,
    [fileToBase64Tool.appletId]: fileToBase64Tool,
    [base64ToFileTool.appletId]: base64ToFileTool,
    [markdownParserTool.appletId]: markdownParserTool,
    [dateToMillisecondsTool.appletId]: dateToMillisecondsTool,
    [mermaidEditorTool.appletId]: mermaidEditorTool,
    [pintoraEditorTool.appletId]: pintoraEditorTool,
    [jsonToCsvTool.appletId]: jsonToCsvTool,
    [csvToJsonTool.appletId]: csvToJsonTool,
    [csvColumnReorderTool.appletId]: csvColumnReorderTool,
    [csvColumnPickerTool.appletId]: csvColumnPickerTool,
    [csvDelimiterConverterTool.appletId]: csvDelimiterConverterTool,
    [csvTransposeTool.appletId]: csvTransposeTool,
    [csvDedupeRowsTool.appletId]: csvDedupeRowsTool,
    [csvSortTool.appletId]: csvSortTool,
    [reactRunnerTool.appletId]: reactRunnerTool,
    [textEscapeUnescapeTool.appletId]: textEscapeUnescapeTool,
    [javascriptRunnerTool.appletId]: javascriptRunnerTool,
    [csvTableViewerTool.appletId]: csvTableViewerTool,
    [jsonTableViewerTool.appletId]: jsonTableViewerTool,
    [colorConverterTool.appletId]: colorConverterTool,
    [jsonToYamlTool.appletId]: jsonToYamlTool,
    [yamlToJsonTool.appletId]: yamlToJsonTool,
    [jsonToTomlTool.appletId]: jsonToTomlTool,
    [sqlFormatterTool.appletId]: sqlFormatterTool,
    [sqlMinifyTool.appletId]: sqlMinifyTool,
    [colorExtractTool.appletId]: colorExtractTool,
    [colorPalleteGeneratorTool.appletId]: colorPalleteGeneratorTool,
    [colorTintsAndShadesTool.appletId]: colorTintsAndShadesTool,

    /**
     * Applet Pages
     */
    [pipelineEditorApplet.appletId]: pipelineEditorApplet,
    [settingsApplet.appletId]: settingsApplet,
    [historyApplet.appletId]: historyApplet,
    [extensionsApplet.appletId]: extensionsApplet,
    [workbenchApplet.appletId]: workbenchApplet
  }

  /**
   * List of builtin preset
   */
  private readonly builtInPresets: Preset[] = [
    {
      appletId: "prefix-suffix-lines",
      presetId: "sql-where-query",
      name: "SQL Where Query",
      category: "SQL",
      inputValues: {
        prefix: "'",
        suffix: "',"
      }
    }
  ]

  /**
   * Map of all loaded applets, builtint, preset and extensions
   */
  mapOfLoadedApplets: Record<string, AppletConstructor> = {
    ...this.builtInApplets
  }

  /**
   * Map of all loaded applets, key value of appletId and appletName
   */
  mapOfLoadedAppletsName: Record<string, string> = {}

  /**
   * Flat array that contains all loaded applets
   */
  listOfLoadedApplets: Array<AppletConstructor<any, any>> = []

  /**
   * Applet store constructor
   */
  constructor() {
    makeAutoObservable(this)
    void this.setupAppletStore()
  }

  /**
   * Setup applet store
   */
  async setupAppletStore() {
    /**
     * Load applets preset and extensions, and build into map and list
     */
    this.loadPresets()
    await this.loadExtensions()
    this.buildApplets()

    /**
     * Setup service that depends on applets
     */
    sessionStore.setupPersistence({
      registerRestoredApplets: (appletIds) => { this.registerRestoredExtensionPages(appletIds) }
    })
    toolSidebarService.setupItems()
    commandbarService.setupItems()
  }

  /**
   * Load applets with type of Preset
   */
  private loadPresets() {
    const mapOfPresets = Object.fromEntries(this.builtInPresets.map((preset) => {
      const mainAppletConstructor = this.builtInApplets[preset.appletId]
      const appletConstructor = mergeAppletConstructorWithPreset(mainAppletConstructor, preset)

      return [appletConstructor.appletId, appletConstructor]
    }))

    this.mapOfLoadedApplets = { ...this.mapOfLoadedApplets, ...mapOfPresets }
  }

  /**
   * Load applets from extension folder
   */
  async loadExtensions() {
    const extensions = await extensionsService.getExtensionsAsAppletContructor()

    const mapOfExtensions = Object.fromEntries(extensions.map((extension) => {
      return [extension.appletId, extension]
    }))

    /**
     * Drop the previously loaded extensions, so a disabled or removed one
     * doesn't linger after a reload
     */
    const mapOfNonExtensions = Object.fromEntries(Object.entries(this.mapOfLoadedApplets).filter(
      ([, applet]) => applet.type !== AppletType.Extension
    ))

    const removedAppletIds = Object.values(this.mapOfLoadedApplets)
      .filter((applet) => applet.type === AppletType.Extension && !mapOfExtensions[applet.appletId])
      .map((applet) => applet.appletId)

    this.mapOfLoadedApplets = { ...mapOfNonExtensions, ...mapOfExtensions }

    // Every installed extension can open its page, named after it
    extensionsService.installedExtensions.forEach((extension) => {
      this.registerExtensionPage(extension.id, extension.manifest?.name ?? extension.folderName)
    })

    /**
     * Tabs of a tool that no longer exists can't run, close them
     */
    sessionStore.sessions
      .filter((session) => removedAppletIds.includes(session.appletId))
      .forEach((session) => { void sessionStore.closeSession(session) })
  }

  /**
   * Make an extension's page openable, or rename it, and return it
   */
  registerExtensionPage(extensionId: string, name: string) {
    const appletConstructor = createExtensionPageApplet(extensionId, name)
    const existing = this.mapOfLoadedApplets[appletConstructor.appletId] as AppletConstructor | undefined

    if (existing?.name === appletConstructor.name) {
      return existing
    }

    this.mapOfLoadedApplets = { ...this.mapOfLoadedApplets, [appletConstructor.appletId]: appletConstructor }
    this.mapOfLoadedAppletsName = { ...this.mapOfLoadedAppletsName, [appletConstructor.appletId]: appletConstructor.name }
    return appletConstructor
  }

  /**
   * Tabs of extension pages restored from the last run, whose extension
   * isn't installed (a catalog one), still need their page to open
   */
  private registerRestoredExtensionPages(appletIds: string[]) {
    appletIds
      .filter((appletId) => appletId.startsWith(EXTENSION_PAGE_APPLET_PREFIX) && !this.mapOfLoadedApplets[appletId])
      .forEach((appletId) => {
        const extensionId = appletId.slice(EXTENSION_PAGE_APPLET_PREFIX.length)
        // The name is filled in once the catalog loads and the page is opened
        this.registerExtensionPage(extensionId, extensionId.split("/").pop() ?? extensionId)
      })
  }

  /**
   * Read the extensions folder again and refresh everything listing tools
   */
  async reloadExtensions() {
    await this.loadExtensions()
    this.buildApplets()
    toolSidebarService.setupItems()
    commandbarService.setupItems()
  }

  /**
   * Build loaded applets into map and list
   */
  buildApplets() {
    // Extension pages open from the extensions page, they aren't listed as tools
    this.listOfLoadedApplets = Object.values(this.mapOfLoadedApplets)
      .filter((applet) => !applet.appletId.startsWith(EXTENSION_PAGE_APPLET_PREFIX))
    this.mapOfLoadedAppletsName = Object.fromEntries(
      Object.entries(this.mapOfLoadedApplets).map((
        [appletId, applet]) => [appletId, applet.name
      ])
    )
  }
}

export const appletStore = new AppletStore()
