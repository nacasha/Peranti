import { makeAutoObservable } from "mobx"

import settingsTool from "src/applets/pages/settings-applet.ts"
import base64EncodeDecodeTool from "src/applets/tools/base64-encode-decode-tool.ts"
import base64ToFileTool from "src/applets/tools/base64-to-file-tool.ts"
import characterCounterTool from "src/applets/tools/character-counter-tool.ts"
import compareListTool from "src/applets/tools/compare-list-tool.ts"
import cronReadableTool from "src/applets/tools/cron-readable-tool.ts"
import dateToMillisecondsTool from "src/applets/tools/date-to-milliseconds.ts"
import faviconGrabberTool from "src/applets/tools/favicon-grabber-tool.ts"
import fileToBase64Tool from "src/applets/tools/file-to-base-64-tool"
import generateRandomStringTool from "src/applets/tools/generate-random-string.ts"
import generateUuidTool from "src/applets/tools/generate-uuid-tool.ts"
import hashTool from "src/applets/tools/hash-tool.ts"
import jsonDiffTool from "src/applets/tools/json-diff-tool"
import jsonFormatter from "src/applets/tools/json-formatter-tool.ts"
import jsonataTool from "src/applets/tools/jsonata-tool"
import loremIpsumGeneratorTool from "src/applets/tools/lorem-ipsum-generator-tool.ts"
import markdownParserTool from "src/applets/tools/markdown-parser-tool.ts"
import mathEvaluatorTool from "src/applets/tools/math-evaluator-tool.ts"
import millisecondsToDate from "src/applets/tools/milliseconds-to-date-tool.ts"
import prefixSuffixLines from "src/applets/tools/prefix-suffix-lines-tool.ts"
import removeDuplicateList from "src/applets/tools/remove-duplicate-lines-tool.ts"
import sortList from "src/applets/tools/sort-list-tool.ts"
import testPipelines from "src/applets/tools/test-pipelines-tool.ts"
import textEditorTool from "src/applets/tools/text-editor-tool.ts"
import textTransformTool from "src/applets/tools/text-transform-tool.ts"
import uriEncodeDecodeTool from "src/applets/tools/uri-encode-decode-tool.ts"
import { FileNames } from "src/constants/file-names.ts"
import { AppletType } from "src/enums/applet-type.ts"
import { FileService } from "src/services/file-service.ts"
import { type AppletConstructor } from "src/types/AppletConstructor.ts"
import { type Preset } from "src/types/Preset.ts"
import { mergeAppletConstructorWithPreset } from "src/utils/merge-applet-constructor-with-preset.ts"

import { appDataService } from "./app-data-service.ts"
import { commandbarService } from "./commandbar-service.ts"
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
    [removeDuplicateList.appletId]: removeDuplicateList,
    [sortList.appletId]: sortList,
    [compareListTool.appletId]: compareListTool,
    [prefixSuffixLines.appletId]: prefixSuffixLines,
    [millisecondsToDate.appletId]: millisecondsToDate,
    [testPipelines.appletId]: testPipelines,
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
    [settingsTool.appletId]: settingsTool
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
    },
    {
      appletId: "generate-random-string",
      presetId: "generate-random-string",
      inputValues: {
        count: "1",
        stringLength: "10",
        smallAz: false,
        capitalAz: false,
        number: true,
        symbol: false,
        runner: ""
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
  private async loadExtensions() {
    const extensions = []
    const entries = await appDataService.readExtensionsFolder()

    for (const entry of entries) {
      if (entry.children) {
        const files = Object.fromEntries(entry.children.map((children) => [children.name, children.path]))

        const appletConstructorRaw = await FileService.readFileAsText(files[FileNames.ExtensionDefinition])
        const appletConstructor: AppletConstructor = JSON.parse(appletConstructorRaw)
        const realActionFilePath = await FileService.resolveFilePath(entry.path, appletConstructor.metadata.actionFile)

        appletConstructor.type = AppletType.Extension
        appletConstructor.metadata.actionFile = realActionFilePath

        extensions.push(appletConstructor)
      }
    }

    const mapOfExtensions = Object.fromEntries(extensions.map((extension) => {
      return [extension.appletId, extension]
    }))

    this.mapOfLoadedApplets = { ...this.mapOfLoadedApplets, ...mapOfExtensions }
  }

  /**
   * Build loaded applets into map and list
   */
  private buildApplets() {
    this.listOfLoadedApplets = Object.values(this.mapOfLoadedApplets)
    this.mapOfLoadedAppletsName = Object.fromEntries(
      Object.entries(this.mapOfLoadedApplets).map((
        [appletId, applet]) => [appletId, applet.name
      ])
    )
  }
}

export const appletStore = new AppletStore()
