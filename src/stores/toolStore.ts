import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { ToolRunModeEnum } from "src/enums/ToolRunTypeEnum"
import { Tool } from "src/models/Tool.ts"
import compareList from "src/tools/compare-list"
import cronReadableTool from "src/tools/cron-readable"
import generateRandomStringTool from "src/tools/generate-random-string"
import generateUuid from "src/tools/generate-uuid"
import hashTool from "src/tools/hash"
import jsonFormatter from "src/tools/json-formatter"
import millisecondsToDate from "src/tools/milliseconds-to-date"
import prefixSuffixLines from "src/tools/prefix-suffix-lines"
import removeDuplicateList from "src/tools/remove-duplicate-lines"
import sortList from "src/tools/sort-list"
import testPipelines from "src/tools/test-pipelines"
import textTransformTool from "src/tools/text-transform"
import { type ToolHistory } from "src/types/ToolHistory.ts"

import { toolHistoryStore } from "./toolHistoryStore.js"

class ToolStore {
  /**
   * Store active tool that currently used
   */
  private _activeTool?: Tool = undefined

  /**
   * Tool run mode
   */
  _runMode: ToolRunModeEnum = ToolRunModeEnum.OnChange

  /**
   * List of tool presets
   */
  private readonly _toolPresets: any[] = [
    {
      toolId: "prefix-suffix-lines",
      presetId: "sql-where-query",
      name: "SQL Where Query",
      inputParams: {
        prefix: "'",
        suffix: "',",
        input: ""
      }
    }
  ]

  /**
   * Map of built-in tools
   */
  private readonly _mapOfTools: Record<string, Tool> = {
    [removeDuplicateList.toolId]: removeDuplicateList,
    [sortList.toolId]: sortList,
    [compareList.toolId]: compareList,
    [prefixSuffixLines.toolId]: prefixSuffixLines,
    [millisecondsToDate.toolId]: millisecondsToDate,
    [testPipelines.toolId]: testPipelines,
    [textTransformTool.toolId]: textTransformTool,
    [hashTool.toolId]: hashTool,
    [generateUuid.toolId]: generateUuid,
    [generateRandomStringTool.toolId]: generateRandomStringTool,
    [jsonFormatter.toolId]: jsonFormatter,
    [cronReadableTool.toolId]: cronReadableTool
  }

  /**
   * Indicates history panel is opened or closed
   */
  isHistoryPanelOpen = false

  get mapOfTools() {
    const presets = Object.fromEntries(this._toolPresets.map((preset) => {
      const mainTool = this._mapOfTools[preset.toolId]
      const tool = Tool.cloneToolBasedOnPreset(mainTool, preset)

      return [tool.toolId, tool]
    }))

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
   * Get current run mode for tool
   */
  get isRunModeAuto() {
    return this._runMode === ToolRunModeEnum.OnChange
  }

  get toolHasBatchOutput() {
    return this.getActiveTool().outputs.some((output) => output.allowBatch)
  }

  /**
   * Make this class observable
   */
  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolStore",
      properties: ["_runMode"],
      storage: window.localStorage
    })
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param tool
   */
  openTool(tool: Tool) {
    if (this.getActiveTool().instanceId !== tool.instanceId) {
      this.saveActiveToolStateToHistory()
      this._activeTool = tool.openTool()
    }
  }

  /**
   * Open history of tool and save the previous tool as history
   *
   * @param toolHistory
   */
  openHistory(toolHistory: ToolHistory) {
    const mainTool = this.mapOfTools[toolHistory.toolId]
    if (mainTool) {
      this.saveActiveToolStateToHistory()
      this._activeTool = Tool.openHistoryReadOnly(mainTool, toolHistory)
    }
  }

  /**
   * Make current active tool history editable
   */
  openToolFromHistory() {
    const toolHistory = this.getActiveTool()
    const mainTool = this.mapOfTools[toolHistory.toolId]
    if (toolHistory) {
      this._activeTool = Tool.openHistory(mainTool, toolHistory)
    }
  }

  /**
   * Save tool to history when tool has been running at least once and not a tool history instance
   */
  saveActiveToolStateToHistory() {
    const activeTool = this._activeTool

    if (activeTool && activeTool.getIsDirty() && !activeTool.isReadOnly) {
      toolHistoryStore.add(activeTool.toHistory())
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

    return Tool.empty()
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
    return this.getActiveTool().instanceId === tool.instanceId
  }

  /**
   * Run active tool and save to history based on run mode
   */
  runActiveTool() {
    this.getActiveTool().run()
    this.saveActiveToolStateToHistory()
  }

  /**
   * Toggle open and close history panel
   */
  toggleHistoryPanel() {
    this.isHistoryPanelOpen = !this.isHistoryPanelOpen
  }

  /**
   * Toggle enable and disable batch mode
   */
  toggleBatchMode() {
    const enabled = !this.getActiveTool().isBatchEnabled
    this.getActiveTool().setBatchMode(enabled)
  }
}

export const toolStore = new ToolStore()
