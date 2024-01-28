import { BaseDirectory, createDir, exists, readDir, readTextFile } from "@tauri-apps/api/fs"
import { appDataDir, resolve } from "@tauri-apps/api/path"
import { makeAutoObservable } from "mobx"

import { Tool } from "src/models/Tool"
import base64EncodeDecodeTool from "src/tools/base64-encode-decode-tool.js"
import base64ToFileTool from "src/tools/base64-to-file-tool.js"
import characterCounterTool from "src/tools/character-counter-tool.ts"
import compareListTool from "src/tools/compare-list-tool.js"
import cronReadableTool from "src/tools/cron-readable-tool.js"
import faviconGrabberTool from "src/tools/favicon-grabber-tool.js"
import fileToBase64Tool from "src/tools/file-to-base-64-tool"
import generateRandomStringTool from "src/tools/generate-random-string.js"
import generateUuidTool from "src/tools/generate-uuid-tool.js"
import hashTool from "src/tools/hash-tool.js"
import jfsGetThTool from "src/tools/jfs-get-th-tool.js"
import jsonDiffTool from "src/tools/json-diff-tool"
import jsonFormatter from "src/tools/json-formatter-tool.js"
import jsonataTool from "src/tools/jsonata-tool"
import loremIpsumGeneratorTool from "src/tools/lorem-ipsum-generator-tool.js"
import markdownParserTool from "src/tools/markdown-parser-tool.js"
import mathEvaluatorTool from "src/tools/math-evaluator-tool.ts"
import millisecondsToDate from "src/tools/milliseconds-to-date-tool.js"
import prefixSuffixLines from "src/tools/prefix-suffix-lines-tool.js"
import removeDuplicateList from "src/tools/remove-duplicate-lines-tool.js"
import sortList from "src/tools/sort-list-tool.js"
import testPipelines from "src/tools/test-pipelines-tool.js"
import textEditorTool from "src/tools/text-editor-tool.js"
import textTransformTool from "src/tools/text-transform-tool.js"
import uriEncodeDecodeTool from "src/tools/uri-encode-decode-tool.js"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolPreset } from "src/types/ToolPreset"

import { toolSessionStore } from "./toolSessionStore.js"

class ToolStore {
  /**
   * Groups the toos by it's categories
   *
   * @configurable
   */
  groupToolsByCategory: boolean = true

  /**
   * Sort tools by name A-Z
   *
   * @configurable
   */
  sortToolAZ: boolean = true

  /**
   * Sort tool categories by name A-Z
   *
   * @configurable
   */
  sortCategoryAZ: boolean = true

  /**
   * List of tool presets
   */
  private readonly _toolPresets: ToolPreset[] = [
    {
      toolId: "prefix-suffix-lines",
      presetId: "sql-where-query",
      name: "SQL Where Query",
      inputValues: {
        prefix: "'",
        suffix: "',"
      }
    },
    {
      toolId: "jsonata",
      presetId: "jsonata-get-rs-outstanding",
      name: "Get RS Outstanding",
      category: "JFS",
      inputValues: {
        expression: "$.data.{\n\t\"loanApplicationId\": loanApplicationId,\n\t\"outstanding\": $sum(repaymentSchedule.amountDetail.(expected - paid))\n}"
      }
    }
  ]

  /**
   * Map of built-in tools
   */
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
    [jfsGetThTool.toolId]: jfsGetThTool,
    [markdownParserTool.toolId]: markdownParserTool
  }

  /**
   * Pair of toolId and tool constructor, default value is built in tools
   */
  mapOfLoadedTools: Record<string, ToolConstructor> = {
    ...this._builtInTools
  }

  /**
   * List of all tools without categorized
   *
   * Example value:
   * ```
   * [compare-list-tool, text-transform-tool, generate-uuid-tool]
   * ```
   */
  listOfLoadedTools: Array<ToolConstructor<any, any>> = []

  /**
   * Pair of toolId and tool name
   *
   * Example value:
   * ```
   * {
   *     "text-transform": "Text Transform",
   *     "math-evaluator": "Math Evaluator",
   *     "compare-list": "Compare List",
   * }
   * ```
   */
  mapOfLoadedToolsName: Record<string, string> = {}

  /**
   * Pair of category name and list of tools
   *
   * Example value:
   * ```
   * {
   *    List: [compare-list, sort-list, remove-duplicate-list],
   *    Text: [word-counter, text-transform]
   * }
   * ```
   */
  listOfCategoriesAndTools: Record<string, ToolConstructor[]> = {}

  /**
   * Indicates tool store has been initialized
   */
  isToolsInitialized: boolean = false

  /**
   * ToolSessionStore constructor
   */
  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Setup built-in tools and preset
   */
  async setupTools() {
    /**
     * Load tool presets
     */
    this.loadToolPresets()

    /**
     * Load tool extensions
     */
    await this.loadToolExtensions()

    // TODO separate

    /**
     * Get values only of mapOfTools (without categorized)
     */
    this.listOfLoadedTools = Object.values(this.mapOfLoadedTools)

    /**
     * Map tools with its name
     */
    this.mapOfLoadedToolsName = Object.fromEntries(
      Object.entries(this.mapOfLoadedTools).map(([toolId, tool]) => [toolId, tool.name])
    )

    // TODO end separate

    /**
     * Setup tools for sidebar
     */
    this.setupToolsForSidebar()

    /**
     * Call setup persistence of tool session to load previous session(s)
     */
    toolSessionStore.setupPersistence()
  }

  private loadToolPresets() {
    /**
     * Prepare tool presets
     */
    const mapOfPresets = Object.fromEntries(this._toolPresets.map((preset) => {
      const toolConstructor = this._builtInTools[preset.toolId]
      const tool = Tool.mergeWithPreset(toolConstructor, preset)

      return [tool.toolId, tool]
    }))

    /**
     * Put presets into loaded tools
     */
    this.mapOfLoadedTools = { ...this.mapOfLoadedTools, ...mapOfPresets }
  }

  private async loadToolExtensions() {
    const EXTENSIONS = "extensions"
    await this.prepareExtensionsFolder()

    const extensions = []
    const entries = await readDir(EXTENSIONS, { dir: BaseDirectory.AppData, recursive: true })

    for (const entry of entries) {
      if (entry.children) {
        const files = Object.fromEntries(entry.children.map((children) => [children.name, children.path]))

        const devPipeDataRaw = await readTextFile(files["devpipe.json"])
        const devPipeData = JSON.parse(devPipeDataRaw)
        devPipeData.type = "Extension"

        const realActionFilePath = await resolve(entry.path, devPipeData.metadata.actionFile)
        devPipeData.metadata.actionFile = realActionFilePath

        extensions.push(devPipeData)
      }
    }

    const mapOfExtensions = Object.fromEntries(extensions.map((extension) => {
      return [extension.toolId, extension]
    }))

    /**
     * Put extensions into loaded tools
     */
    this.mapOfLoadedTools = { ...this.mapOfLoadedTools, ...mapOfExtensions }
  }

  /**
   * Prepare tools for categorized
   */
  private setupToolsForSidebar() {
    let listOfCategoriesAndTools: Record<string, ToolConstructor[]> = { General: [] }
    if (this.groupToolsByCategory) {
      listOfCategoriesAndTools = Object.fromEntries(toolStore.listOfLoadedTools.map((tool) => [tool.category, [] as Tool[]]))
    }

    /**
     * Put each tools on its category
     */
    [...toolStore.listOfLoadedTools].forEach((tool) => {
      if (this.groupToolsByCategory) {
        listOfCategoriesAndTools[tool.category].push(tool)
      } else {
        listOfCategoriesAndTools.General.push(tool)
      }
    })

    /**
     * Sort all tools by name
     */
    if (this.sortToolAZ) {
      listOfCategoriesAndTools = Object.fromEntries(
        Object.entries(listOfCategoriesAndTools).map(([category, tools]) => {
          return [category, tools.sort((a, b) => a.name < b.name ? -1 : 0)]
        })
      )
    }

    /**
     * Sort categories name
     */
    if (this.sortCategoryAZ) {
      listOfCategoriesAndTools = Object.fromEntries(
        Object.entries(listOfCategoriesAndTools).sort(([categoryA], [categoryB]) => {
          return categoryA < categoryB ? -1 : 0
        })
      )
    }

    this.listOfCategoriesAndTools = listOfCategoriesAndTools
  }

  /**
   * Prepare extensions folder by creating the folder
   * in user app data folder if not exists
   */
  private async prepareExtensionsFolder() {
    const EXTENSIONS = "extensions"

    const appDataDirs = BaseDirectory.AppData
    const baseFolder = await appDataDir()

    try {
      if (!(await exists(baseFolder))) {
        await createDir(baseFolder)
      }

      if (!(await exists(EXTENSIONS, { dir: appDataDirs }))) {
        await createDir(EXTENSIONS, { dir: appDataDirs })
      }
    } catch (err: any) {
      console.log(err)
    }
  }
}

export const toolStore = new ToolStore()
