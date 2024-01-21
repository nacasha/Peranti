import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolHistory } from "src/types/ToolHistory.js"
import { type ToolSession } from "src/types/ToolIdle.js"

import { toolHistoryStore } from "./toolHistoryStore.js"
import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolStore } from "./toolStore.js"

class ToolSessionStore {
  /**
   * The store has been persisted
   */
  isPersisted: boolean = false

  /**
   * The store has been initialized
   */
  isInitialized: boolean = false

  /**
   * Allow editor to have multiple sessions at once
   */
  enableMultipleSession = true

  /**
   * List of tool sessions
   */
  sessions: ToolSession[] = []

  /**
   * Pair of toolId and list of created session names
   */
  sessionNames: Record<string, Array<string | undefined>> = {}

  /**
   * Pair of toolId and last active sessionId
   */
  activeSessionIds: Record<string, string> = {}

  getToolFromLocalStorage(toolSession: ToolSession) {
    const toolData = localStorage.getItem("Tool".concat(toolSession.sessionId))

    if (toolData) {
      const { toolHistory }: { toolHistory: ToolHistory } = JSON.parse(toolData)
      const toolConstructor = toolStore.mapOfTools[toolHistory.toolId]

      return new Tool(toolConstructor, { toolHistory })
    }

    return Tool.empty()
  }

  /**
   * Generate session name for tool
   *
   * @param tool
   * @returns
   */
  generateSessionName(tool: ToolConstructor) {
    if (!this.sessionNames[tool.toolId]) {
      this.sessionNames[tool.toolId] = ["reserved"]
    }

    let nextIndex
    const sessionCounters = this.sessionNames[tool.toolId]
    const smallestIndex = sessionCounters.findIndex((e) => e === undefined || e === null)

    if (smallestIndex === -1) {
      nextIndex = sessionCounters.length
    } else {
      nextIndex = smallestIndex
    }

    const sessionName = "Editor ".concat(nextIndex.toString())
    this.sessionNames[tool.toolId][nextIndex] = sessionName

    return sessionName
  }

  /**
   * ToolSessionStore constructor
   */
  constructor() {
    makeAutoObservable(this)
  }

  setupPersistence() {
    if (this.isPersisted) {
      return
    }

    this.setIsPersisted(true)

    void makePersistable(this, {
      name: "ToolSessionStore",
      properties: [
        "sessionNames",
        "enableMultipleSession",
        "activeSessionIds",
        "sessions"
      ],
      storage: window.localStorage
    }).then(() => {
      this.setIsInitialized(true)
    })
  }

  private setIsInitialized(value: boolean) {
    this.isInitialized = value
  }

  private setIsPersisted(value: boolean) {
    this.isPersisted = value
  }

  /**
   * Create new session and set as active tool
   *
   * @param toolConstructor
   */
  createSession(
    toolConstructor: ToolConstructor,
    options: ConstructorParameters<typeof Tool>["1"] = {}
  ) {
    /**
     * Create sessionName for tool
     */
    const newOptions: typeof options = {
      ...options,
      sessionName: this.generateSessionName(toolConstructor)
    }

    /**
     * Initialize new tool based on arguments
     */
    const tool = new Tool(toolConstructor, newOptions)

    /**
     * Push new tool into session
     */
    this.pushIntoSessionList(tool.toSession())
    this.openTool(tool)
  }

  /**
   * Create session from tool history
   *
   * @param toolHistory
   */
  createSessionFromHistory(toolHistory: ToolHistory) {
    const mainTool = toolStore.mapOfTools[toolHistory.toolId]

    /**
     * Deep copy toolHistory to new variable to avoid modifying original data
     */
    const clonedToolHistory = {
      ...toolHistory,

      /**
       * Generate new sessionId to avoid using sessionId from toolHistory
       */
      sessionId: Tool.generateSessionId()
    }

    this.createSession(mainTool, { toolHistory: clonedToolHistory })
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param toolConstructor
   */
  findOrCreateSession(toolConstructor: ToolConstructor) {
    const runningSessions = this.getRunningSessionsFromTool(toolConstructor.toolId)

    /**
     * Create new if there is no existing sessions
     */
    if (runningSessions.length === 0) {
      this.createSession(toolConstructor)

    /**
     * Restore active session(s) of tool
     */
    } else {
      const activeTool = toolRunnerStore.getActiveTool()
      const lastToolSessionId = this.activeSessionIds[toolConstructor.toolId]

      /**
       * Skip action if the session is already opened
       */
      if (activeTool.sessionId === lastToolSessionId) {
        return
      }

      const lastToolSession = runningSessions.find(
        (toolSession) => toolSession.sessionId === lastToolSessionId
      )

      this.openSession(lastToolSession ?? runningSessions[0])
    }
  }

  /**
   * Open tool session and set active
   *
   * @param tool
   */
  openSession(toolSession: ToolSession) {
    const tool = this.getToolFromLocalStorage(toolSession)
    this.openTool(tool)
  }

  /**
   * Open initizlied tool session
   *
   * @param tool
   */
  openTool(tool: Tool) {
    const activeTool = toolRunnerStore.getActiveTool()
    if (activeTool) {
      activeTool.stopStore()
    }

    toolRunnerStore.setActiveTool(tool)
    this.setActiveToolSessionId(tool)
  }

  /**
   * Close running tool session
   *
   * @param tool
   */
  closeSession(toolSession: ToolSession) {
    const activeTool = toolRunnerStore.getActiveTool()
    this.sessions = this.sessions.filter((session) => session.sessionId !== toolSession.sessionId)

    /**
     * Save to history
     */
    this.saveClosedToolToHistory(toolSession)

    if (activeTool.sessionId === toolSession.sessionId) {
      const existingSessions = this.sessions.filter((session) => session.toolId === toolSession.toolId)

      /**
       * Create empty session if it's last session of the tool
       */
      if (existingSessions.length === 0) {
        const toolConstructor = toolStore.mapOfTools[toolSession.toolId]

        /**
         * I have no idea but this code makes the method `createSession`
         * using the commited variable of `this.sessionNames`
         *
         * This is done to avoid creating new session with session name "Editor 2"
         * when closing the "Editor 1"
         */
        setTimeout(() => {
          this.createSession(toolConstructor)
        }, 0)

      /**
       * Open any session is there are more than one session(s) running
       */
      } else {
        this.openSession(existingSessions[0])
      }
    }

    this.detachToolWithSessionNames(toolSession)
  }

  /**
   * Detach tool with default session names
   *
   * @param toolSession
   */
  detachToolWithSessionNames(toolSession: ToolSession) {
    const deletedIndex = this.sessionNames[toolSession.toolId].findIndex((e) => e === toolSession.sessionName)

    if (deletedIndex >= 0) {
      this.sessionNames[toolSession.toolId][deletedIndex] = undefined
    }
  }

  /**
   * Set pair of toolId and sessionId
   *
   * @param tool
   */
  setActiveToolSessionId(tool: ToolSession) {
    this.activeSessionIds[tool.toolId] = tool.sessionId
  }

  /**
   * Add to closed session history if tool has been modified
   *
   * @param tool
   */
  private saveClosedToolToHistory(toolSession: ToolSession) {
    const tool = this.getToolFromLocalStorage(toolSession)

    if (
      tool.getIsInputAndOutputHasValues() &&
      (tool.isInputValuesModified || tool.isOutputValuesModified) &&
      tool.runCount > 0
    ) {
      toolHistoryStore.addHistory(tool.toHistory())
    }
  }

  /**
   * Push created tool session into list
   *
   * @param tool
   */
  pushIntoSessionList(tool: ToolSession) {
    this.sessions.push(tool)
  }

  /**
   * Get all sessions of tool
   *
   * @param toolId
   * @returns
   */
  getRunningSessionsFromTool(toolId: string) {
    return this.sessions.filter((session) => session.toolId === toolId)
  }
}

export const toolSessionStore = new ToolSessionStore()
