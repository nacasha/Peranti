import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolHistory } from "src/types/ToolHistory.js"

import { toolHistoryStore } from "./toolHistoryStore.js"
import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolStore } from "./toolStore.js"

class ToolSessionStore {
  /**
   * Allow editor to have multiple sessions at once
   */
  enableMultipleSession = true

  /**
   * List of running sessions
   */
  sessions: Tool[] = []

  /**
   * Pair of toolId and list of running session name(s)
   */
  sessionNames: Record<string, Array<string | undefined>> = {}

  /**
   * Pair of toolId and sessionId
   */
  activeSessionIds: Record<string, string> = {}

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
    const smallestIndex = this.sessionNames[tool.toolId].findIndex((e) => !e)

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

    void makePersistable(this, {
      name: "ToolSessionStore",
      properties: [
        "sessionNames",
        "enableMultipleSession",
        "activeSessionIds",
        {
          key: "sessions",
          serialize: (sessions: this["sessions"]) => {
            /**
             * Map all running sessions to history
             */
            const serializedSessions = sessions.map((session) => session.toHistory())
            return serializedSessions
          },
          deserialize: (sessions: ToolHistory[]) => {
            const toolSessions = sessions.map((session) => {
              const mainTool = toolStore.mapOfTools[session.toolId]
              return new Tool(mainTool, { toolHistory: session })
            })
            return toolSessions
          }
        }
      ] as any,
      storage: window.localStorage
    })
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
    this.pushIntoSessionList(tool)
    this.openSession(tool)
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
      sessionId: Tool.generateSessionId(),

      /**
       * Remove existing sessionName from toolHistory in order to create new sessionName
       */
      sessionName: undefined
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
      const lastToolSessionId = this.activeSessionIds[toolConstructor.toolId]
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
  openSession(tool: Tool) {
    toolRunnerStore.setActiveTool(tool)
    this.setActiveToolSessionId(tool)
  }

  /**
   * Close running tool session
   *
   * @param tool
   */
  closeSession(tool: Tool) {
    const activeTool = toolRunnerStore.getActiveTool()
    this.sessions = this.sessions.filter((session) => session.sessionId !== tool.sessionId)
    this.saveToolToHistory(tool)

    if (activeTool.sessionId === tool.sessionId) {
      const existingSessions = this.sessions.filter((session) => session.toolId === tool.toolId)

      /**
       * Create empty session if it's last session of the tool
       */
      if (existingSessions.length === 0) {
        this.createSession(tool)

      /**
       * Open any session is there are more than one session(s) running
       */
      } else {
        this.openSession(existingSessions[0])
      }
    }

    const deletedIndex = this.sessionNames[tool.toolId].findIndex((e) => e === tool.sessionName)

    if (deletedIndex >= 0) {
      this.sessionNames[tool.toolId][deletedIndex] = undefined
    }
  }

  /**
   * Set pair of toolId and sessionId
   *
   * @param tool
   */
  setActiveToolSessionId(tool: Tool) {
    this.activeSessionIds[tool.toolId] = tool.sessionId
  }

  /**
   * Add to closed session history if tool has been modified
   *
   * @param tool
   */
  private saveToolToHistory(tool: Tool) {
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
  pushIntoSessionList(tool: Tool) {
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
