import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool.ts"
import { type ToolConstructor } from "src/types/ToolConstructor.js"
import { type ToolHistory } from "src/types/ToolHistory.ts"

import { toolHistoryStore } from "./toolHistoryStore.js"
import { toolStore } from "./toolStore.js"

class ToolRunnerStore {
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

  private setActiveTool(activeTool: Tool) {
    this._activeTool = activeTool
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param toolConstructor
   */
  openToolConstructor(
    toolConstructor: ToolConstructor,
    options: { force?: boolean, skipSaveCurrentTool?: boolean, skipRestore?: boolean } = {}
  ) {
    const { force = false, skipSaveCurrentTool = false, skipRestore = false } = options
    const activeTool = this.getActiveTool()

    if ((activeTool.toolId !== toolConstructor.toolId) || force) {
      if (!skipSaveCurrentTool) {
        this.saveActiveToolToHistory()
        this.saveActiveToolLastState()
      }

      let toolHistory
      if ((this._restoreLastToolInputAndOutput && toolConstructor.type !== "Preset") && !skipRestore) {
        const toolLastState = toolHistoryStore.getLastStateOfToolId(toolConstructor.toolId)
        if (toolLastState) {
          toolHistory = toolLastState
        // toolHistory.instanceId = Tool.generateInstanceId()
        }
      }

      const tool = new Tool(toolConstructor, { toolHistory })
      this.setActiveTool(tool)
      return tool
    }
  }

  openTool(tool: Tool) {
    this.setActiveTool(tool)
  }

  /**
   * Open history of tool and save the previous tool as history
   *
   * @param toolHistory
   */
  openToolHistory(toolHistory: ToolHistory) {
    const activeTool = this.getActiveTool()
    const toolConstructor = toolStore.mapOfTools[toolHistory.toolId]

    if (activeTool.sessionId !== toolHistory.sessionId) {
      this.saveActiveToolToHistory()
      this.saveActiveToolLastState()

      this.setActiveTool(new Tool(toolConstructor, { toolHistory, isReadOnly: true }))
    }
  }

  /**
   * Make current tool history editable
   */
  makeCurrentToolHistoryEditable() {
    const activeToolHistory = this.getActiveTool()
    const toolConstructor = toolStore.mapOfTools[activeToolHistory.toolId]

    this.setActiveTool(new Tool(toolConstructor, {
      /**
       * Randomize sessionId of tool history to avoid conflict
       */
      toolHistory: activeToolHistory.toHistory({ randomizeSessionId: true })
    }))
  }

  /**
   * Save tool to history when tool has been running at least once
   * and not an instance of tool history
   */
  private saveActiveToolToHistory() {
    const activeTool = this._activeTool

    if (activeTool && activeTool.getIsInputAndOutputHasValues() && !activeTool.isReadOnly) {
      /**
       * Always randomize current active tool sessionId when saving to history
       */
      toolHistoryStore.add(activeTool.toHistory({ randomizeSessionId: true }))
    }
  }

  /**
   * Save active tool to last state history
   */
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
    const activeTool = this._activeTool

    if (activeTool) {
      return activeTool
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
  isToolActive(tool: ToolConstructor | ToolHistory) {
    return this.getActiveTool().toolId === tool.toolId
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActiveBySessionId(tool: Tool | ToolHistory) {
    return this.getActiveTool().sessionId === tool.sessionId
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

  /**
   * Set flag of restore last tool state
   *
   * @param value
   */
  setRestoreLastToolInputAndOutput(value: boolean) {
    this._restoreLastToolInputAndOutput = value
  }

  /**
   * Clean current active tool editor input and output state
   */
  cleanActiveToolState() {
    const activeTool = this.getActiveTool()

    this.setActiveTool(new Tool({ ...activeTool }))
  }

  backToTool() {
    const activeTool = this.getActiveTool()
    const toolConstructor = toolStore.mapOfTools[activeTool.toolId]

    this.openToolConstructor(toolConstructor, { force: true, skipSaveCurrentTool: true })
  }
}

export const toolRunnerStore = new ToolRunnerStore()
