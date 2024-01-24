import localforage from "localforage"
import { makeAutoObservable, toJS } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { storageKeys } from "src/constants/storage-keys.js"
import { Tool } from "src/models/Tool"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolHistory } from "src/types/ToolHistory.js"
import { type ToolSession } from "src/types/ToolSession.js"

import { toolHistoryStore } from "./toolHistoryStore.js"
import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolStore } from "./toolStore.js"

class ToolSessionStore {
  /**
   * The store has been persisted
   */
  private _isPersisted: boolean = false

  /**
   * The store has been initialized
   */
  isInitialized: boolean = false

  /**
   * Allow editor to have multiple sessions at once
   *
   * @configurable
   */
  enableMultipleSession = true

  /**
   * Close the tool when the last session is closed
   *
   * @configurable
   */
  closeToolWhenLastSessionIsClosed = false

  /**
   * Unified tool sessions
   *
   * @configurable
   */
  unifiedToolSession = true

  /**
   * New created session will be placed in the last of session (most right)
   * Only applied when creating session using hotkey
   *
   * Creating new session using Tool Tabbar Add button will always placed at the end of list
   *
   * @configurable
   */
  newSessionPushLast = false

  /**
   * List of tool sessions
   */
  sessions: ToolSession[] = []

  /**
   * Pair of toolId and list of created sequence of session
   */
  sessionSequences: Record<string, boolean[]> = {}

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
    const toolConstructor = toolStore.mapOfLoadedTools[toolSession.toolId]
    const cachedSession: { toolHistory: ToolHistory } | null = await localforage.getItem(
      storageKeys.Tool.concat(toolSession.sessionId)
    )

    if (cachedSession) {
      return new Tool(toolConstructor, { initialState: cachedSession.toolHistory, disablePersistence })
    }
    return new Tool(toolConstructor, { initialState: toolSession, disablePersistence })
  }

  keepAliveSession(sessionId: string, value: boolean) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === sessionId)

    if (sessionIndex > -1) {
      this.sessions[sessionIndex] = {
        ...this.sessions[sessionIndex],
        isActionRunning: value,
        keepAlive: value
      }
    }
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
    if (this._isPersisted) {
      return
    }

    this.setIsPersisted(true)

    void makePersistable(this, {
      name: storageKeys.ToolSessionStore,
      stringify: false,
      properties: [
        "sessionSequences",
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
    this._isPersisted = value
  }

  /**
   * Create new session and set as active tool
   *
   * @param toolConstructor
   */
  createSession(
    toolConstructor: ToolConstructor,
    options: ConstructorParameters<typeof Tool>["1"] = {},
    placeSessionAtTheEnd: boolean = false
  ) {
    /**
     * Exit if there is no tool to be created
     */
    if (toolConstructor.toolId === "") {
      return
    }

    /**
     * Create sessionName for tool
     */
    const newOptions: typeof options = {
      ...options,
      sessionSequenceNumber: this.attachSessionSequence(toolConstructor)
    }

    /**
     * Initialize new tool based on arguments
     */
    const tool = new Tool(toolConstructor, newOptions)

    /**
     * Push new tool into session
     */
    this.pushIntoSessionList(tool.toSession(), placeSessionAtTheEnd)
    this.activateTool(tool)

    return tool.toSession()
  }

  /**
   * Create session from tool history
   *
   * @param toolHistory
   */
  createSessionFromHistory(toolHistory: ToolHistory) {
    const mainTool = toolStore.mapOfLoadedTools[toolHistory.toolId]

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

    const tool = await this.getToolFromLocalStorage(toolSession)
    this.activateTool(tool)
  }

  /**
   * Activate created session of tool
   *
   * @param tool
   */
  activateTool(tool: Tool) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (tool.sessionId === activeTool.sessionId) {
      return
    }

    /**
     * Deactivate currently active tool
     */
    void this.deactivateCurrentSession()

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
  async closeSession(toolSession: ToolSession) {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Save old sessions of tool for future reference
     */
    const oldSessionsOfTool = this.getRunningSessions(toolSession.toolId)

    /**
     * Filter sessions without closed tool
     */
    this.sessions = this.sessions.filter((session) => session.sessionId !== toolSession.sessionId)

    /**
     * Begin process to close session
     */
    await this.proceedCloseSession(toolSession)

    /**
     * Early exit if closed session is not currently active tool
     */
    if (activeTool.sessionId !== toolSession.sessionId) {
      return
    }

    const newSessionsOfTool = this.getRunningSessions(toolSession.toolId)

    /**
     * Create another session if closed session if the last session of tool
     */
    if (newSessionsOfTool.length === 0) {
      /**
       * Reset name of session because list is already empty
       */
      this.resetToolSessionSequence(toolSession.toolId)

      /**
       * Close tool based on preferences
       */
      if (this.closeToolWhenLastSessionIsClosed) {
        this.activateTool(Tool.empty())
        return
      }

      /**
       * Open new session of tool
       */
      const toolConstructor = toolStore.mapOfLoadedTools[toolSession.toolId]
      this.createSession(toolConstructor)

      /**
       * Open another existing sessions from tool based on closed tool session index
       */
    } else {
      let newSessionToBeOpened
      const closedSessionIndex = oldSessionsOfTool.findIndex(
        (session) => session.sessionId === toolSession.sessionId
      )

      /**
       * If closed session is not found on list of session, it means closeSession()
       * was called more than once with same session (usually through holding the hotkey)
       */
      if (closedSessionIndex < 0) {
        return
      }

      if (closedSessionIndex <= newSessionsOfTool.length - 1) {
        newSessionToBeOpened = newSessionsOfTool[closedSessionIndex]
      } else {
        newSessionToBeOpened = newSessionsOfTool[closedSessionIndex - 1]
      }

      void this.openSession(newSessionToBeOpened)
    }
  }

  resetToolSessionSequence(toolId: string) {
    this.sessionSequences[toolId] = [true]
  }

  /**
   * Generate session name for tool
   *
   * @param tool
   * @returns
   */
  attachSessionSequence(tool: ToolConstructor) {
    if (!this.sessionSequences[tool.toolId]) {
      this.resetToolSessionSequence(tool.toolId)
    }

    if (this.sessionSequences[tool.toolId].length === 1) {
      this.sessionSequences[tool.toolId][1] = true
      return 1
    }

    let nextIndex
    const sessionSequences = toJS(this.sessionSequences[tool.toolId])
    const smallestIndex = sessionSequences.findIndex((e) => !e || e === undefined)

    if (smallestIndex === -1) {
      nextIndex = sessionSequences.length
    } else {
      nextIndex = smallestIndex
    }

    /**
     * This block code purposely to avoid new session has same sequence number
     * when holding the CLOSE_TAB hotkey
     */
    if (nextIndex === 1) {
      const runningSessions = this.getRunningSessionsFromTool(tool.toolId)

      /**
       * When tool has 1 running session but nextIndex is 1, increase the nextIndex
       */
      if (runningSessions.length === 1 && runningSessions[0].sessionSequenceNumber === nextIndex) {
        this.sessionSequences[tool.toolId][1] = true
        nextIndex = nextIndex + 1
      }
    }

    this.sessionSequences[tool.toolId][nextIndex] = true
    return nextIndex
  }

  /**
   * Detach tool with default session names
   *
   * @param toolSession
   */
  detachSessionSequence(toolSession: ToolSession) {
    const sessions = this.sessionSequences[toolSession.toolId]
    const deletedIndex = sessions.findIndex(
      (_, index) => index === toolSession.sessionSequenceNumber
    )

    if (deletedIndex >= 0) {
      this.sessionSequences[toolSession.toolId][deletedIndex] = false
    } else if (sessions.filter((e) => e).length === 1) {
      this.resetToolSessionSequence(toolSession.toolId)
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
  private async proceedCloseSession(toolSession: ToolSession) {
    /**
     * Load tool from storage but disable the persistence, we only need
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

    /**
     * Remove closed tool session name from store
     */
    this.detachSessionSequence(toolSession)
  }

  private async deactivateCurrentSession() {
    const activeTool = toolRunnerStore.getActiveTool()

    /**
     * Disable session reference to store if session has no action running
     */
    if (!activeTool.isActionRunning) {
      activeTool.stopStore()
    }
  }

  /**
   * Push created tool session into list
   *
   * @param tool
   */
  pushIntoSessionList(tool: ToolSession, placeSessionAtTheEnd: boolean = false) {
    if (this.newSessionPushLast || placeSessionAtTheEnd) {
      this.sessions.push(tool)
    } else {
      const activeTool = toolRunnerStore.getActiveTool()

      const runningSessions = this.getRunningSessions(activeTool.toolId)
      const indexOfActiveTool = runningSessions.findIndex((session) => (
        session.sessionId === activeTool.sessionId
      ))

      this.sessions.splice(indexOfActiveTool + 1, 0, tool)
    }
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

  getRunningSessions(toolId: string) {
    if (this.unifiedToolSession) {
      return this.sessions
    }

    return this.getRunningSessionsFromTool(toolId)
  }
}

export const toolSessionStore = new ToolSessionStore()
