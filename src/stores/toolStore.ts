import { observable } from "mobx"

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
  groupToolsByCategory: boolean = true

  sortToolAZ: boolean = true

  sortCategoryAZ: boolean = true

  listOfCategoriesAndTools: Record<string, ToolConstructor[]> = {}

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
    [base64ToFileTool.toolId]: base64ToFileTool
  }

  @observable listOfTools: Array<ToolConstructor<any, any>> = []

  @observable mapOfToolsName: Record<string, string> = {}

  @observable mapOfTools: Record<string, ToolConstructor> = {}

  @observable isToolsInitialized: boolean = false

  setupTools() {
    const mapOfTools = () => {
      const presets = Object.fromEntries(this._toolPresets.map((preset) => {
        const toolConstructor = this._mapOfTools[preset.toolId]
        const tool = Tool.mergeWithPreset(toolConstructor, preset)

        return [tool.toolId, tool]
      }))

      return { ...this._mapOfTools, ...presets }
    }

    /**
     * List of built-in tools
     */
    const listOfTools = () => {
      return Object.values(this.mapOfTools)
    }

    /**
     * List of built-in tools name
     */
    const mapOfToolsName = () => {
      return Object.fromEntries(
        Object.entries(this.mapOfTools).map(([toolId, tool]) => [toolId, tool.name])
      )
    }

    this.mapOfTools = mapOfTools()
    this.listOfTools = listOfTools()
    this.mapOfToolsName = mapOfToolsName()

    this.setupToolsForSidebar()
    toolSessionStore.setupPersistence()
  }

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
