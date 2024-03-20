import { makeAutoObservable } from "mobx"

import pipelineEditorApplet from "src/applets/pages/pipeline-editor-applet.ts"
import settingsApplet from "src/applets/pages/settings-applet.ts"
import base64EncodeDecodeTool from "src/applets/tools/base64-encode-decode-tool.ts"
import base64ToFileTool from "src/applets/tools/base64-to-file-tool.ts"
import characterCounterTool from "src/applets/tools/character-counter-tool.ts"
import { colorConverterTool } from "src/applets/tools/color-converter-tool/color-converter-tool.ts"
import compareListTool from "src/applets/tools/compare-list-tool.ts"
import cronReadableTool from "src/applets/tools/cron-readable-tool.ts"
import { csvTableViewerTool } from "src/applets/tools/csv-viewer-tool/csv-table-viewer-tool.ts"
import dateToMillisecondsTool from "src/applets/tools/date-to-milliseconds.ts"
import faviconGrabberTool from "src/applets/tools/favicon-grabber-tool.ts"
import fileToBase64Tool from "src/applets/tools/file-to-base-64-tool"
import generateRandomStringTool from "src/applets/tools/generate-random-string.ts"
import generateUuidTool from "src/applets/tools/generate-uuid-tool.ts"
import hashTool from "src/applets/tools/hash-tool.ts"
import { javascriptRunnerTool } from "src/applets/tools/javascript-runner-tool/javascript-runner-tool.ts"
import jsonDiffTool from "src/applets/tools/json-diff-tool"
import jsonFormatter from "src/applets/tools/json-formatter-tool.ts"
import { jsonToCsvTool } from "src/applets/tools/json-to-csv-tool/json-to-csv-tool.ts"
import { jsonToTomlTool } from "src/applets/tools/json-to-toml-tool/json-to-toml-tool.ts"
import { jsonToYamlTool } from "src/applets/tools/json-to-yaml-tool/json-to-yaml-tool.ts"
import { jsonTableViewerTool } from "src/applets/tools/json-viewer-tool/json-table-viewer-tool.ts"
import { jsonataTool } from "src/applets/tools/jsonata-tool/jsonata-tool.ts"
import loremIpsumGeneratorTool from "src/applets/tools/lorem-ipsum-generator-tool.ts"
import markdownParserTool from "src/applets/tools/markdown-parser-tool.ts"
import mathEvaluatorTool from "src/applets/tools/math-evaluator-tool.ts"
import mermaidEditorTool from "src/applets/tools/mermaid-editor-tool.ts"
import millisecondsToDate from "src/applets/tools/milliseconds-to-date-tool.ts"
import pintoraEditorTool from "src/applets/tools/pintora-editor-tool.ts"
import prefixSuffixLines from "src/applets/tools/prefix-suffix-lines-tool.ts"
import { reactRunnerTool } from "src/applets/tools/react-runner-tool/react-runner-tool.ts"
import removeDuplicateList from "src/applets/tools/remove-duplicate-lines-tool.ts"
import sortList from "src/applets/tools/sort-list-tool.ts"
import textEditorTool from "src/applets/tools/text-editor-tool.ts"
import textEscapeUnescapeTool from "src/applets/tools/text-escape-unescape-tool/text-escape-unescape-tool.ts"
import textTransformTool from "src/applets/tools/text-transform-tool.ts"
import uriEncodeDecodeTool from "src/applets/tools/uri-encode-decode-tool.ts"
import { yamlToJsonTool } from "src/applets/tools/yaml-to-json-tool/yaml-to-json-tool.ts"
import { type AppletConstructor } from "src/models/AppletConstructor.ts"
import { type Preset } from "src/types/Preset.ts"
import { mergeAppletConstructorWithPreset } from "src/utils/merge-applet-constructor-with-preset.ts"

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
    [reactRunnerTool.appletId]: reactRunnerTool,
    [textEscapeUnescapeTool.appletId]: textEscapeUnescapeTool,
    [javascriptRunnerTool.appletId]: javascriptRunnerTool,
    [csvTableViewerTool.appletId]: csvTableViewerTool,
    [jsonTableViewerTool.appletId]: jsonTableViewerTool,
    [colorConverterTool.appletId]: colorConverterTool,
    [jsonToYamlTool.appletId]: jsonToYamlTool,
    [yamlToJsonTool.appletId]: yamlToJsonTool,
    [jsonToTomlTool.appletId]: jsonToTomlTool,

    /**
     * Applet Pages
     */
    [pipelineEditorApplet.appletId]: pipelineEditorApplet,
    [settingsApplet.appletId]: settingsApplet
  }

  /**
   * List of builtin preset
   */
  private readonly builtInPresets: Preset[] = [
    {
      appletId: "prefix-suffix-lines",
      presetId: "sql-where-query",
      name: "SQL Where Query",
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
    sessionStore.setupPersistence()
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

    this.mapOfLoadedApplets = { ...this.mapOfLoadedApplets, ...mapOfExtensions }
  }

  /**
   * Build loaded applets into map and list
   */
  buildApplets() {
    this.listOfLoadedApplets = Object.values(this.mapOfLoadedApplets)
    this.mapOfLoadedAppletsName = Object.fromEntries(
      Object.entries(this.mapOfLoadedApplets).map((
        [appletId, applet]) => [appletId, applet.name
      ])
    )
  }
}

export const appletStore = new AppletStore()
