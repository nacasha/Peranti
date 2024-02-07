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
import { AppDataService } from "src/services/app-data-service.ts"
import { FileService } from "src/services/file-service.ts"
import { type AppletConstructor } from "src/types/AppletConstructor.ts"
import { type Preset } from "src/types/Preset.ts"
import { mergeAppletConstructorWithPreset } from "src/utils/merge-applet-constructor-with-preset.ts"

import { sessionStore } from "./session-store.ts"

class AppletStore {
  groupByCategory: boolean = true

  private readonly sortNameAZ: boolean = true

  private readonly sortCategoryAZ: boolean = true

  private readonly presets: Preset[] = [
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

  mapOfLoadedApplets: Record<string, AppletConstructor> = {
    ...this.builtInApplets
  }

  mapOfLoadedAppletsName: Record<string, string> = {}

  listOfLoadedApplets: Array<AppletConstructor<any, any>> = []

  listOfCategoriesAndApplets: Record<string, AppletConstructor[]> = {}

  isInitialized: boolean = false

  constructor() {
    makeAutoObservable(this)
    void this.setupAppletStore()
  }

  async setupAppletStore() {
    this.loadPresets()
    await this.loadExtensions()

    this.buildApplets()
    this.setupForSidebar()
    sessionStore.setupPersistence()
  }

  private buildApplets() {
    this.listOfLoadedApplets = Object.values(this.mapOfLoadedApplets)
    this.mapOfLoadedAppletsName = Object.fromEntries(
      Object.entries(this.mapOfLoadedApplets).map((
        [appletId, applet]) => [appletId, applet.name
      ])
    )
  }

  private loadPresets() {
    const mapOfPresets = Object.fromEntries(this.presets.map((preset) => {
      const mainAppletConstructor = this.builtInApplets[preset.appletId]
      const appletConstructor = mergeAppletConstructorWithPreset(mainAppletConstructor, preset)

      return [appletConstructor.appletId, appletConstructor]
    }))

    this.mapOfLoadedApplets = { ...this.mapOfLoadedApplets, ...mapOfPresets }
  }

  private async loadExtensions() {
    const extensions = []
    const entries = await AppDataService.readExtensionsFolder()

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

  private setupForSidebar() {
    let listOfCategoriesAndApplets: Record<string, AppletConstructor[]> = { General: [] }

    if (this.groupByCategory) {
      listOfCategoriesAndApplets = Object.fromEntries(appletStore.listOfLoadedApplets.map(
        (applet) => [applet.category, [] as AppletConstructor[]]
      ))
    }

    [...appletStore.listOfLoadedApplets].forEach((applet) => {
      if (applet.hideOnSidebar) {
        return
      }

      if (this.groupByCategory) {
        listOfCategoriesAndApplets[applet.category].push(applet)
      } else {
        listOfCategoriesAndApplets.General.push(applet)
      }
    })

    if (this.sortNameAZ) {
      listOfCategoriesAndApplets = Object.fromEntries(
        Object.entries(listOfCategoriesAndApplets).map(([category, applets]) => {
          return [category, applets.sort((a, b) => a.name < b.name ? -1 : 0)]
        })
      )
    }

    if (this.sortCategoryAZ) {
      listOfCategoriesAndApplets = Object.fromEntries(
        Object.entries(listOfCategoriesAndApplets).sort(([categoryA], [categoryB]) => {
          return categoryA < categoryB ? -1 : 0
        })
      )
    }

    listOfCategoriesAndApplets = Object.fromEntries(
      Object.entries(listOfCategoriesAndApplets).filter(([, applets]) => {
        return applets.length > 0
      })
    )

    this.listOfCategoriesAndApplets = listOfCategoriesAndApplets
  }
}

export const appletStore = new AppletStore()