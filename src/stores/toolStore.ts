import { makeAutoObservable } from "mobx"

import { Files } from "src/constants/files.ts"
import { ToolType } from "src/enums/ToolType.ts"
import { AppDataService } from "src/services/AppDataService.ts"
import { FileService } from "src/services/fileService.ts"
import base64EncodeDecodeTool from "src/tools/base64-encode-decode-tool.ts"
import base64ToFileTool from "src/tools/base64-to-file-tool.ts"
import characterCounterTool from "src/tools/character-counter-tool.ts"
import compareListTool from "src/tools/compare-list-tool.ts"
import cronReadableTool from "src/tools/cron-readable-tool.ts"
import dateToMillisecondsTool from "src/tools/date-to-milliseconds.ts"
import faviconGrabberTool from "src/tools/favicon-grabber-tool.ts"
import fileToBase64Tool from "src/tools/file-to-base-64-tool"
import generateRandomStringTool from "src/tools/generate-random-string.ts"
import generateUuidTool from "src/tools/generate-uuid-tool.ts"
import hashTool from "src/tools/hash-tool.ts"
import jsonDiffTool from "src/tools/json-diff-tool"
import jsonFormatter from "src/tools/json-formatter-tool.ts"
import jsonataTool from "src/tools/jsonata-tool"
import loremIpsumGeneratorTool from "src/tools/lorem-ipsum-generator-tool.ts"
import markdownParserTool from "src/tools/markdown-parser-tool.ts"
import mathEvaluatorTool from "src/tools/math-evaluator-tool.ts"
import millisecondsToDate from "src/tools/milliseconds-to-date-tool.ts"
import prefixSuffixLines from "src/tools/prefix-suffix-lines-tool.ts"
import removeDuplicateList from "src/tools/remove-duplicate-lines-tool.ts"
import settingsTool from "src/tools/settings-tool.ts"
import sortList from "src/tools/sort-list-tool.ts"
import testPipelines from "src/tools/test-pipelines-tool.ts"
import textEditorTool from "src/tools/text-editor-tool.ts"
import textTransformTool from "src/tools/text-transform-tool.ts"
import uriEncodeDecodeTool from "src/tools/uri-encode-decode-tool.ts"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolPreset } from "src/types/ToolPreset"
import { mergeToolConstructorWithPreset } from "src/utils/mergeToolConstructorWithPreset.ts"

import { sessionStore } from "./sessionStore.ts"

class ToolStore {
  groupToolsByCategory: boolean = true

  sortToolAZ: boolean = true

  sortCategoryAZ: boolean = true

  private readonly _toolPresets: ToolPreset[] = [
    {
      toolId: "prefix-suffix-lines",
      presetId: "sql-where-query",
      name: "SQL Where Query",
      inputValues: {
        prefix: "'",
        suffix: "',"
      }
    }
    // {
    //   toolId: "jsonata",
    //   presetId: "jsonata-get-rs-outstanding",
    //   name: "Get RS Outstanding",
    //   category: "JFS",
    //   inputValues: {
    //     expression: "$.data.{\n\t\"loanApplicationId\": loanApplicationId,\n\t\"outstanding\": $sum(repaymentSchedule.amountDetail.(expected - paid))\n}"
    //   }
    // }
  ]

  private readonly _builtInTools: Record<string, ToolConstructor> = {
    [removeDuplicateList.toolId]: removeDuplicateList,
    [sortList.toolId]: sortList,
    [compareListTool.toolId]: compareListTool,
    [prefixSuffixLines.toolId]: prefixSuffixLines,
    [millisecondsToDate.toolId]: millisecondsToDate,
    [testPipelines.toolId]: testPipelines,
    [textTransformTool.toolId]: textTransformTool,
    [hashTool.toolId]: hashTool,
    [generateUuidTool.toolId]: generateUuidTool,
    [generateRandomStringTool.toolId]: generateRandomStringTool,
    [jsonFormatter.toolId]: jsonFormatter,
    [cronReadableTool.toolId]: cronReadableTool,
    [mathEvaluatorTool.toolId]: mathEvaluatorTool,
    [characterCounterTool.toolId]: characterCounterTool,
    [uriEncodeDecodeTool.toolId]: uriEncodeDecodeTool,
    [base64EncodeDecodeTool.toolId]: base64EncodeDecodeTool,
    [loremIpsumGeneratorTool.toolId]: loremIpsumGeneratorTool,
    [faviconGrabberTool.toolId]: faviconGrabberTool,
    [textEditorTool.toolId]: textEditorTool,
    [jsonDiffTool.toolId]: jsonDiffTool,
    [jsonataTool.toolId]: jsonataTool,
    [fileToBase64Tool.toolId]: fileToBase64Tool,
    [base64ToFileTool.toolId]: base64ToFileTool,
    [markdownParserTool.toolId]: markdownParserTool,
    [dateToMillisecondsTool.toolId]: dateToMillisecondsTool,
    [settingsTool.toolId]: settingsTool
  }

  mapOfLoadedTools: Record<string, ToolConstructor> = {
    ...this._builtInTools
  }

  listOfLoadedTools: Array<ToolConstructor<any, any>> = []

  mapOfLoadedToolsName: Record<string, string> = {}

  listOfCategoriesAndTools: Record<string, ToolConstructor[]> = {}

  isToolsInitialized: boolean = false

  constructor() {
    makeAutoObservable(this)
    void this.setupTools()
  }

  async setupTools() {
    this.loadToolPresets()
    await this.loadToolExtensions()

    this.buildTools()

    this.setupToolsForSidebar()

    sessionStore.setupPersistence()
  }

  private buildTools() {
    this.listOfLoadedTools = Object.values(this.mapOfLoadedTools)

    this.mapOfLoadedToolsName = Object.fromEntries(
      Object.entries(this.mapOfLoadedTools).map(([toolId, tool]) => [toolId, tool.name])
    )
  }

  private loadToolPresets() {
    const mapOfPresets = Object.fromEntries(this._toolPresets.map((preset) => {
      const toolConstructor = this._builtInTools[preset.toolId]
      const tool = mergeToolConstructorWithPreset(toolConstructor, preset)

      return [tool.toolId, tool]
    }))

    this.mapOfLoadedTools = { ...this.mapOfLoadedTools, ...mapOfPresets }
  }

  private async loadToolExtensions() {
    const extensions = []
    const entries = await AppDataService.readExtensionsFolder()

    for (const entry of entries) {
      if (entry.children) {
        const files = Object.fromEntries(entry.children.map((children) => [children.name, children.path]))

        const toolConstructorRaw = await FileService.readFileAsText(files[Files.ExtensionDefinition])
        const toolConstructor: ToolConstructor = JSON.parse(toolConstructorRaw)
        const realActionFilePath = await FileService.resolveFilePath(entry.path, toolConstructor.metadata.actionFile)

        toolConstructor.type = ToolType.Extension
        toolConstructor.metadata.actionFile = realActionFilePath

        extensions.push(toolConstructor)
      }
    }

    const mapOfExtensions = Object.fromEntries(extensions.map((extension) => {
      return [extension.toolId, extension]
    }))

    this.mapOfLoadedTools = { ...this.mapOfLoadedTools, ...mapOfExtensions }
  }

  private setupToolsForSidebar() {
    let listOfCategoriesAndTools: Record<string, ToolConstructor[]> = { General: [] }
    if (this.groupToolsByCategory) {
      listOfCategoriesAndTools = Object.fromEntries(toolStore.listOfLoadedTools.map(
        (tool) => [tool.category, [] as ToolConstructor[]]
      ))
    }

    [...toolStore.listOfLoadedTools].forEach((tool) => {
      if (tool.hideOnSidebar) {
        return
      }

      if (this.groupToolsByCategory) {
        listOfCategoriesAndTools[tool.category].push(tool)
      } else {
        listOfCategoriesAndTools.General.push(tool)
      }
    })

    if (this.sortToolAZ) {
      listOfCategoriesAndTools = Object.fromEntries(
        Object.entries(listOfCategoriesAndTools).map(([category, tools]) => {
          return [category, tools.sort((a, b) => a.name < b.name ? -1 : 0)]
        })
      )
    }

    if (this.sortCategoryAZ) {
      listOfCategoriesAndTools = Object.fromEntries(
        Object.entries(listOfCategoriesAndTools).sort(([categoryA], [categoryB]) => {
          return categoryA < categoryB ? -1 : 0
        })
      )
    }

    listOfCategoriesAndTools = Object.fromEntries(
      Object.entries(listOfCategoriesAndTools).filter(([, tools]) => {
        return tools.length > 0
      })
    )

    this.listOfCategoriesAndTools = listOfCategoriesAndTools
  }
}

export const toolStore = new ToolStore()
