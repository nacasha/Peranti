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
  groupToolsByCategory: boolean = false

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
   * Pair of category name and list of tools
   *
   * Example:
   * {
   *    List: [compare-list, sort-list, remove-duplicate-list],
   *    Text: [word-counter, text-transform]
   * }
   */
  listOfCategoriesAndTools: Record<string, ToolConstructor[]> = {}

  /**
   * List of all tools without categorized
   */
  listOfTools: Array<ToolConstructor<any, any>> = []

  /**
   * Pair of toolId and tool name
   *
   * Example:
   * {
   *     "text-transform": "Text Transform",
   *     "math-evaluator": "Math Evaluator",
   *     "compare-list": "Compare List",
   * }
   */
  mapOfToolsName: Record<string, string> = {}

  /**
   * Pair of toolId and tool constructor
   */
  mapOfToolsAndPresets: Record<string, ToolConstructor> = {}

  /**
   * Indicates tools has been initialized
   */
  isToolsInitialized: boolean = false

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
  private readonly _mapOfTools: Record<string, ToolConstructor> = {
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
    [jfsGetThTool.toolId]: jfsGetThTool
  }

  /**
   * Setup built-in tools and preset
   */
  setupTools() {
    /**
     * Prepare tool presets
     */
    const presets = Object.fromEntries(this._toolPresets.map((preset) => {
      const toolConstructor = this._mapOfTools[preset.toolId]
      const tool = Tool.mergeWithPreset(toolConstructor, preset)

      return [tool.toolId, tool]
    }))

    /**
     * Combine tools and presets into one variable
     */
    this.mapOfToolsAndPresets = { ...this._mapOfTools, ...presets }

    /**
     * Get values only of mapOfTools (without categorized)
     */
    this.listOfTools = Object.values(this.mapOfToolsAndPresets)

    /**
     * Map tools with its name
     */
    this.mapOfToolsName = Object.fromEntries(
      Object.entries(this.mapOfToolsAndPresets).map(([toolId, tool]) => [toolId, tool.name])
    )

    this.setupToolsForSidebar()

    /**
     * Call setup persistence of tool session to load previous session(s)
     */
    toolSessionStore.setupPersistence()
  }

  /**
   * Prepare tools for categorized
   */
  private setupToolsForSidebar() {
    let listOfCategoriesAndTools: Record<string, ToolConstructor[]> = { General: [] }
    if (this.groupToolsByCategory) {
      listOfCategoriesAndTools = Object.fromEntries(toolStore.listOfTools.map((tool) => [tool.category, [] as Tool[]]))
    }

    /**
     * Put each tools on its category
     */
    toolStore.listOfTools.forEach((tool) => {
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
}

export const toolStore = new ToolStore()
