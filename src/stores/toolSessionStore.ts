import localForage from "localforage"
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

  /**
   * Load tool from local storage and create new instance of tool
   *
   * @param toolSession
   * @param options
   * @returns
   */
  async getToolFromLocalStorage(toolSession: ToolSession, options: { disablePersistence?: boolean } = {}) {
    const { disablePersistence = false } = options
    const toolConstructor = toolStore.mapOfToolsAndPresets[toolSession.toolId]
    const cachedSession: { toolHistory: ToolHistory } | null = await localForage.getItem("Tool".concat(toolSession.sessionId))

    if (cachedSession) {
      return new Tool(toolConstructor, { initialState: cachedSession.toolHistory, disablePersistence })
    }
    return new Tool(toolConstructor, { initialState: toolSession, disablePersistence })
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

  /**
   * Setup persistence to load previous
   *
   * @returns
   */
  setupPersistence() {
    if (this.isPersisted) {
      return
    }

    this.setIsPersisted(true)

    void makePersistable(this, {
      name: "ToolSessionStore",
      storage: localForage,
      stringify: false,
      properties: [
        "sessionNames",
        "enableMultipleSession",
        "activeSessionIds",
        "sessions"
      ]
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

    return tool.toSession()
  }

  /**
   * Create session from tool history
   *
   * @param toolHistory
   */
  createSessionFromHistory(toolHistory: ToolHistory) {
    const mainTool = toolStore.mapOfToolsAndPresets[toolHistory.toolId]

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

    this.createSession(mainTool, { initialState: clonedToolHistory })
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

      void this.openSession(lastToolSession ?? runningSessions[0])
    }
  }

  /**
   * Open tool session and set active
   *
   * @param tool
   */
  async openSession(toolSession: ToolSession) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (activeTool.sessionId === toolSession.sessionId) {
      return
    }

    /**
     * Disable persist for currently opened tool session
     */
    activeTool.stopStore()

    const tool = await this.getToolFromLocalStorage(toolSession)
    this.openTool(tool)
  }

  /**
   * Open initialized tool instance
   *
   * @param tool
   */
  openTool(tool: Tool) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (tool.sessionId === activeTool.sessionId) {
      return
    }

    /**
     * Stop store (disable persistence) for currently active tool
     */
    if (activeTool) {
      activeTool.stopStore()
    }

    /**
     * Set new tool as active tool
     */
    toolRunnerStore.setActiveTool(tool)
    this.setActiveToolSessionId(tool)
  }

  /**
   * Close tool session
   *
   * @param tool
   */
  closeSession(toolSession: ToolSession) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Save old sessions of tool for future reference
     */
    const oldSessionsOfTool = this.sessions.filter((session) => session.toolId === toolSession.toolId)

    /**
     * Filter sessions without closed tool
     */
    this.sessions = this.sessions.filter((session) => session.sessionId !== toolSession.sessionId)

    /**
     * Begin rountine for closed session of tool
     */
    void this.proceedClosedSession(toolSession)

    /**
     * Run another routine if the closed session is the currently active tool
     */
    if (activeTool.sessionId === toolSession.sessionId) {
      const newSessionsOfTool = this.sessions.filter((session) => session.toolId === toolSession.toolId)

      /**
       * Create empty session if it's last session of the tool
       */
      if (newSessionsOfTool.length === 0) {
        /**
         * Reset name of session because list is already empty
         */
        this.sessionNames[toolSession.toolId] = ["reserved"]

        const toolConstructor = toolStore.mapOfToolsAndPresets[toolSession.toolId]

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
       * Open another existing sessions from tool based on closed tool session index
       */
      } else {
        let newSessionToBeOpened
        const closedSessionIndex = oldSessionsOfTool.findIndex(
          (session) => session.sessionId === toolSession.sessionId
        )

        if (closedSessionIndex >= 0) {
          if (closedSessionIndex <= newSessionsOfTool.length - 1) {
            newSessionToBeOpened = newSessionsOfTool[closedSessionIndex]
          } else {
            newSessionToBeOpened = newSessionsOfTool[closedSessionIndex - 1]
          }
        } else {
          newSessionToBeOpened = newSessionsOfTool[0]
        }

        void this.openSession(newSessionToBeOpened)
      }
    }

    /**
     * Remove closed tool session name from store
     */
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
   * Save tool session to history if tool has been modified
   * and delete its local storage
   *
   * @param tool
   */
  private async proceedClosedSession(toolSession: ToolSession) {
    /**
     * Load tool from storage but disable the persistence, because we only need
     * to get tool state and save it into history
     */
    const toolHistory = await this.getToolFromLocalStorage(toolSession, { disablePersistence: true })

    if (toolHistory) {
      toolHistory.destroyLocalStorage()

      if (
        toolHistory.getIsInputAndOutputHasValues() &&
      (toolHistory.isInputValuesModified || toolHistory.isOutputValuesModified) &&
      toolHistory.runCount > 0
      ) {
        toolHistoryStore.addHistory(toolHistory.toHistory())
      }
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
