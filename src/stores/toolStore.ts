import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool.ts"
import base64EncodeDecodeTool from "src/tools/base64-encode-decode-tool.js"
import characterCounterTool from "src/tools/character-counter-tool.ts"
import compareListTool from "src/tools/compare-list-tool.js"
import cronReadableTool from "src/tools/cron-readable-tool.js"
import faviconGrabberTool from "src/tools/favicon-grabber-tool.js"
import generateRandomStringTool from "src/tools/generate-random-string.js"
import generateUuid from "src/tools/generate-uuid-tool.js"
import hashTool from "src/tools/hash-tool.js"
import jsonFormatter from "src/tools/json-formatter-tool.js"
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
import { type ToolConstructor } from "src/types/ToolConstructor.js"
import { type ToolHistory } from "src/types/ToolHistory.ts"
import { type ToolPreset } from "src/types/ToolPreset.ts"

import { toolHistoryStore } from "./toolHistoryStore.js"

class ToolStore {
  /**
   * Save last state of tool when change to another tool
   */
  private _restoreLastToolInputAndOutput: boolean = true

  /**
   * Indicates history panel is opened or closed
   */
  private _isHistoryPanelOpen = false

  /**
   * Store active tool that currently used
   */
  private _activeTool?: Tool = undefined

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
        suffix: "',",
        input: ""
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
    [generateUuid.toolId]: generateUuid,
    [generateRandomStringTool.toolId]: generateRandomStringTool,
    [jsonFormatter.toolId]: jsonFormatter,
    [cronReadableTool.toolId]: cronReadableTool,
    [mathEvaluatorTool.toolId]: mathEvaluatorTool,
    [characterCounterTool.toolId]: characterCounterTool,
    [uriEncodeDecodeTool.toolId]: uriEncodeDecodeTool,
    [base64EncodeDecodeTool.toolId]: base64EncodeDecodeTool,
    [loremIpsumGeneratorTool.toolId]: loremIpsumGeneratorTool,
    [faviconGrabberTool.toolId]: faviconGrabberTool,
    [textEditorTool.toolId]: textEditorTool
  }

  get mapOfTools() {
    // const presets = Object.fromEntries(this._toolPresets.map((preset) => {
    //   const mainTool = this._mapOfTools[preset.toolId]
    //   const tool = mainTool.mergeWithPreset(preset)

    //   return [tool.toolId, tool]
    // }))

    const presets: Record<string, ToolConstructor> = {}

    return { ...this._mapOfTools, ...presets }
  }

  /**
   * List of built-in tools
   */
  get listOfTools() {
    return Object.values(this.mapOfTools)
  }

  /**
   * List of built-in tools name
   */
  get mapOfToolsName(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.mapOfTools).map(([toolId, tool]) => [toolId, tool.name])
    )
  }

  /**
   * Determine whether current active tool has batch operations
   */
  get toolHasBatchOutput() {
    return this.getActiveTool().getInputFields().some((output) => output.allowBatch)
  }

  get isHistoryPanelOpen() {
    return this._isHistoryPanelOpen
  }

  /**
   * Make this class observable
   */
  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolStore",
      properties: [],
      storage: window.localStorage
    })
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param toolConstructor
   */
  openTool(toolConstructor: ToolConstructor) {
    const activeTool = this.getActiveTool()

    if (activeTool.toolId !== toolConstructor.toolId) {
      /**
       * Save current active tool state to history
       */
      this.saveActiveToolToHistory(true)

      /**
       * Save current active tool state to last state history
       */
      this.saveActiveToolLastState()

      /**
       * Restore current active tool with previous state if allowed
       */
      if (this._restoreLastToolInputAndOutput && toolConstructor.type !== "Preset") {
        const toolLastState = toolHistoryStore.getLastStateOfToolId(toolConstructor.toolId)
        if (toolLastState) {
          toolLastState.instanceId = Tool.generateInstanceId()
          this._activeTool = new Tool(toolConstructor, { toolHistory: toolLastState })
        } else {
          this._activeTool = new Tool(toolConstructor)
        }
      } else {
        this._activeTool = new Tool(toolConstructor)
      }
    }
  }

  /**
   * Open history of tool and save the previous tool as history
   *
   * @param toolHistory
   */
  openToolHistory(toolHistory: ToolHistory) {
    const activeTool = this.getActiveTool()
    const toolConstructor = this.mapOfTools[toolHistory.toolId]

    if (activeTool.instanceId !== toolHistory.instanceId) {
      this.saveActiveToolToHistory(true)
      this._activeTool = new Tool(toolConstructor, { toolHistory, isReadOnly: true })
    }
  }

  /**
   * Make current tool history editable
   */
  makeCurrentToolHistoryEditable() {
    const activeToolHistory = this.getActiveTool()
    const toolConstructor = this.mapOfTools[activeToolHistory.toolId]

    this._activeTool = new Tool(toolConstructor, { toolHistory: activeToolHistory.toHistory() })
  }

  /**
   * Save tool to history when tool has been running at least once
   * and not an instance of tool history
   */
  private saveActiveToolToHistory(immediately = false) {
    const activeTool = this._activeTool

    if (activeTool && activeTool.getIsInputAndOutputHasValues() && !activeTool.isReadOnly) {
      toolHistoryStore.add(activeTool.toHistory(), immediately)
    }
  }

  private saveActiveToolLastState() {
    const activeTool = this._activeTool
    if (activeTool && this._restoreLastToolInputAndOutput && !activeTool.isReadOnly) {
      toolHistoryStore.setLastState(activeTool.toHistory())
    }
  }

  /**
   * Get current active tool, or return empty if there is no active tool
   *
   * @returns Tool
   */
  getActiveTool() {
    const currentTool = this._activeTool

    if (currentTool) {
      return currentTool
    }

    return new Tool({
      name: "",
      toolId: "",
      category: "",
      action: () => ({}),
      inputFields: [],
      outputFields: []
    })
  }

  /**
   * Get active tool name
   *
   * @returns String
   */
  getActiveToolName() {
    return this.getActiveTool().name
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActive(tool: Tool | ToolHistory) {
    return this.getActiveTool().toolId === tool.toolId
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActiveByInstanceId(tool: Tool | ToolHistory) {
    return this.getActiveTool().instanceId === tool.instanceId
  }

  /**
   * Run active tool and save to history
   */
  runActiveTool() {
    void this.getActiveTool().run()
  }

  /**
   * Toggle open and close history panel
   */
  toggleHistoryPanel() {
    this._isHistoryPanelOpen = !this._isHistoryPanelOpen
  }

  /**
   * Toggle enable and disable batch mode
   */
  toggleBatchMode() {
    const enabled = !this.getActiveTool().isBatchEnabled
    this.getActiveTool().setBatchMode(enabled)
  }

  setRestoreLastToolInputAndOutput(value: boolean) {
    this._restoreLastToolInputAndOutput = value
  }

  resetTool() {
    const activeTool = this.getActiveTool()

    this._activeTool = new Tool({ ...activeTool })
  }
}

export const toolStore = new ToolStore()
