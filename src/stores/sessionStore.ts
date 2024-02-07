import { makeAutoObservable, toJS } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.ts"
import { Tool } from "src/models/Tool"
import { ToolStorageManager } from "src/services/toolStorageManager.ts"
import { type Session } from "src/types/Session.ts"
import { type SessionHistory } from "src/types/SessionHistory.ts"
import { type ToolConstructor } from "src/types/ToolConstructor"

import { activeSessionStore } from "./activeSessionStore.ts"
import { sessionHistoryStore } from "./sessionHistoryStore.ts"
import { toolStore } from "./toolStore.ts"

class SessionStore {
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
  closeToolWhenLastSessionIsClosed = true

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
   * Creating new session using `Tool Tabbar Add button` will always placed at the end of list
   *
   * @configurable
   */
  placeNewSessionToLast = false

  /**
   * List of tool sessions
   */
  sessions: Session[] = []

  /**
   * List of tools that has running action
   */
  runningTools: Record<string, Tool | undefined> = {}

  /**
   * Pair of toolId and list of created sequence of session
   */
  sessionSequences: Record<string, boolean[]> = {}

  /**
   * Pair of each tool last active sessionId
   */
  activeSessionIdOfTools: Record<string, string> = {}

  /**
   * Currently active sessionId
   */
  activeSessionId: string = ""

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
    void makePersistable(this, {
      name: StorageKeys.SessionStore,
      stringify: false,
      properties: [
        "sessionSequences",
        "enableMultipleSession",
        "activeSessionIdOfTools",
        "activeSessionId",
        "sessions"
      ]
    }).then(() => {
      void this.handleHydratedStore()
    })
  }

  /**
   * Action handler when store is successfully hydrated from storage
   */
  async handleHydratedStore() {
    await this.openLastActiveSession()
    this.setIsInitialized(true)
  }

  /**
   * Activate last active session id
   */
  async openLastActiveSession() {
    const toolSession = this.sessions.find((session) => session.sessionId === this.activeSessionId)

    if (toolSession) {
      const tool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)

      if (tool) {
        this.activateTool(tool)
      }
    } else {
      this.activateTool(Tool.empty())
    }
  }

  /**
   * Set value of isInitialized
   *
   * @param value
   */
  private setIsInitialized(value: boolean) {
    this.isInitialized = value
  }

  /**
   * Set value of isActionRunning and isKeepAlive
   *
   * @param sessionId
   * @param value
   */
  keepAliveSession(sessionId: string, value: boolean) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === sessionId)

    if (sessionIndex > -1) {
      this.sessions[sessionIndex] = {
        ...this.sessions[sessionIndex],
        isActionRunning: value,
        isKeepAlive: value
      }
    }
  }

  /**
   * Create new session and set as active tool
   *
   * @param toolConstructor
   */
  createSession(
    toolConstructor: ToolConstructor,
    toolOptions: ConstructorParameters<typeof Tool>["1"] = {},
    placeSessionAtTheEnd: boolean = false
  ) {
    /**
     * Exit if there is no tool to be created
     */
    if (toolConstructor.toolId === "") {
      return
    }

    if (toolConstructor.disableMultipleSession) {
      if (this.getRunningSessionsFromTool(toolConstructor.toolId).length > 0) {
        return
      }
    }

    /**
     * Create sessionName for tool
     */
    const newOptions: typeof toolOptions = {
      ...toolOptions,
      initialState: toolOptions?.initialState ?? {}
    }

    /**
     * Attach session sequence if initialState has no sessionName
     */
    if (newOptions.initialState && !newOptions.initialState?.sessionName) {
      newOptions.initialState.sessionSequenceNumber = this.attachSessionSequence(toolConstructor.toolId)
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
    return tool
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
     * Open existing session(s)
     */
    } else {
      const activeTool = activeSessionStore.getActiveTool()
      const lastToolSessionId = this.activeSessionIdOfTools[toolConstructor.toolId]

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
  async openSession(toolSession: Session) {
    const activeTool = activeSessionStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (activeTool.sessionId === toolSession.sessionId) {
      return
    }

    const tool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)
    if (tool) {
      this.activateTool(tool)
    }
  }

  /**
   * Open tool session and set active
   *
   * @param tool
   */
  async openSessionId(sessionId: string) {
    const activeTool = activeSessionStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (activeTool.sessionId === sessionId) {
      return
    }

    const tool = await ToolStorageManager.getToolFromStorage(sessionId)
    if (tool) {
      this.activateTool(tool)
    }
  }

  /**
   * Create session from tool history
   *
   * @param toolState
   */
  async openHistory(toolHistory: SessionHistory) {
    const tool = await ToolStorageManager.getToolFromStorage(toolHistory.sessionId)

    if (tool) {
      /**
       * Set deleted is false and assign session sequence if tool has no sessionName
       */
      const isDeleted = false
      const sessionSequenceNumber = !tool.sessionName
        ? this.attachSessionSequence(toolHistory.toolId)
        : undefined

      tool.setIsDeleted(isDeleted)
      tool.setSessionSequenceNumber(sessionSequenceNumber)

      /**
       * Push into session list in last position and activate tool
       */
      this.pushIntoSessionList(tool.toSession(), true)
      activeSessionStore.setActiveTool(tool)
      this.setActiveToolSessionId(tool)
    }
  }

  /**
   * Activate created session of tool
   *
   * @param tool
   */
  activateTool(tool: Tool) {
    const activeTool = activeSessionStore.getActiveTool()

    /**
     * Skip action if tool is already opened
     */
    if (activeTool.sessionId === tool.sessionId) {
      return
    }

    /**
     * Deactivate currently active tool
     */
    void this.deactivateTool(activeTool)

    /**
     * Set new tool as active tool
     */
    activeSessionStore.setActiveTool(tool)
    this.setActiveToolSessionId(tool)
  }

  /**
   * Deactivate session but keep it in the list of session
   */
  private async deactivateTool(tool: Tool) {
    /**
     * Save to state if the tool has running action
     */
    if (tool.isActionRunning) {
      this.runningTools[tool.sessionId] = tool

    /**
     * Disable session reference to store if session has no action running
     */
    } else {
      if (this.runningTools[tool.sessionId]) {
        this.runningTools[tool.sessionId] = undefined
      }
    }
  }

  private removeSessionBySessionId(sessionId: string) {
    /**
     * Filter sessions without closed tool
     */
    let removedSessionIndex = -1
    this.sessions = this.sessions.filter((session, index) => {
      if (session.sessionId === sessionId) {
        removedSessionIndex = index
        return false
      }
      return true
    })

    return removedSessionIndex
  }

  /**
   * Close tool session and remove from list of session state
   *
   * @param tool
   */
  async closeSession(toolSession: Session, skipOpenAnotherSession: boolean = false) {
    const activeTool = activeSessionStore.getActiveTool()

    /**
     * Filter sessions without closed tool
     */
    const closedSessionIndex = this.removeSessionBySessionId(toolSession.sessionId)

    /**
     * If closed session is currently active tool, application will
     * open another running session based on closed session index
     */
    if (!skipOpenAnotherSession && (activeTool.sessionId === toolSession.sessionId)) {
      const newSessionsOfTool = this.getRunningSessions(toolSession.toolId)

      /**
       * Create another session if closed session if the last session of tool
       */
      if (newSessionsOfTool.length === 0) {
        /**
         * Reset session sequence (to remove array item with value = false) because list is empty
         */
        this.resetToolSessionSequence(toolSession.toolId)

        /**
         * Open empty tool if user has preference to close tool when all session is closed
         */
        if (this.closeToolWhenLastSessionIsClosed) {
          this.activateTool(Tool.empty())

        /**
         * Open new session of tool
         */
        } else {
          const toolConstructor = toolStore.mapOfLoadedTools[toolSession.toolId]
          this.createSession(toolConstructor)
        }
      /**
       * Open another existing sessions from tool based on closed tool session index
       */
      } else if (closedSessionIndex > -1) {
        /**
         * If closed session is not found on list of session, it means closeSession()
         * was called more than once with same session (usually because hold the hotkey)
         */
        let newSessionToBeOpened
        if (closedSessionIndex <= newSessionsOfTool.length - 1) {
          newSessionToBeOpened = newSessionsOfTool[closedSessionIndex]
        } else {
          newSessionToBeOpened = newSessionsOfTool[closedSessionIndex - 1]
        }

        void this.openSession(newSessionToBeOpened)
      }
    }

    /**
     * Begin process to close session
     */
    if (activeTool.sessionId === toolSession.sessionId) {
      await this.proceedCloseSession({ tool: activeTool })
    } else {
      await this.proceedCloseSession({ toolSession })
    }
  }

  /**
   * Close all session and remove it's store reference as well as the storage
   */
  closeAllSession() {
    this.sessions.forEach((session) => {
      void this.closeSession(session, true)
    })

    /**
     * Empty the session
     */
    this.sessions = []

    /**
     * Reset session sequence
     */
    this.sessionSequences = {}

    /**
     * Open empty tool
     */
    this.activateTool(Tool.empty())
  }

  /**
   * Close all session except one tool session
   *
   * @param toolSession
   */
  async closeOtherSession(toolSession: Session) {
    this.sessions.forEach((session) => {
      if (session.sessionId !== toolSession.sessionId) {
        void this.closeSession(session, true)
      }
    })

    /**
     * Empty the session and remains the choosen tool sesion
     */
    this.sessions = [toolSession]

    /**
     * Reset session sequence
     */
    this.sessionSequences = {}
    this.sessionSequences[toolSession.toolId] = [true]
    if (toolSession.sessionSequenceNumber) {
      this.sessionSequences[toolSession.toolId][toolSession.sessionSequenceNumber] = true
    }

    /**
     * Open selected tool
     */
    const tool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)
    if (tool) {
      this.activateTool(tool)
    }
  }

  /**
   * Reset session sequence of tool
   *
   * @param toolId
   */
  resetToolSessionSequence(toolId: string) {
    this.sessionSequences[toolId] = [true]
  }

  /**
   * Generate session name for tool
   *
   * @param toolId
   * @returns
   */
  attachSessionSequence(toolId: string) {
    if (!this.sessionSequences[toolId]) {
      this.resetToolSessionSequence(toolId)
    }

    if (this.sessionSequences[toolId].length === 1) {
      this.sessionSequences[toolId][1] = true
      return 1
    }

    let nextIndex
    const sessionSequences = toJS(this.sessionSequences[toolId])
    const smallestIndex = sessionSequences.findIndex((e) => !e || e === undefined)

    if (smallestIndex === -1) {
      nextIndex = sessionSequences.length
    } else {
      nextIndex = smallestIndex
    }

    /**
     * This block code purposely to prevent new session has same sequence number
     * when holding the CLOSE_TAB hotkey
     */
    if (nextIndex === 1) {
      const runningSessions = this.getRunningSessionsFromTool(toolId)

      /**
       * When tool has 1 running session but nextIndex is 1, increase the nextIndex
       */
      if (runningSessions.length === 1 && runningSessions[0].sessionSequenceNumber === nextIndex) {
        this.sessionSequences[toolId][1] = true
        nextIndex = nextIndex + 1
      }
    }

    this.sessionSequences[toolId][nextIndex] = true
    return nextIndex
  }

  /**
   * Remove sequnce number from tool session and tool state
   *
   * @param toolSession
   */
  async detachSessionSequence(toolSession: Session) {
    const sessions = this.sessionSequences[toolSession.toolId] ?? []
    const deletedIndex = sessions.findIndex(
      (_, index) => index === toolSession.sessionSequenceNumber
    )

    if (deletedIndex >= 0) {
      this.sessionSequences[toolSession.toolId][deletedIndex] = false
    }

    if (sessions.filter((e) => e).length === 1) {
      this.resetToolSessionSequence(toolSession.toolId)
    }

    await ToolStorageManager.updateToolStatePropertyInStorage(toolSession.sessionId, {
      sessionSequenceNumber: undefined
    })
  }

  /**
   * Set pair of toolId and sessionId
   *
   * @param tool
   */
  setActiveToolSessionId(tool: Session) {
    this.activeSessionIdOfTools[tool.toolId] = tool.sessionId
    this.activeSessionId = tool.sessionId
  }

  /**
   * Save tool session to history if tool has been modified
   * and delete its local storage
   *
   * @param tool
   */
  private async proceedCloseSession(options: { toolSession?: Session, tool?: Tool }) {
    const { toolSession, tool } = options
    let toBeDeletedTool: Tool | undefined

    if (tool) {
      toBeDeletedTool = tool

      /**
       * Stop store persistence since it gonna be deleted anyway
       */
      toBeDeletedTool.stopStore()
    } else if (toolSession) {
      /**
       * Load tool from storage but disable the persistence, because not active session
       * either will be mark as deleted or removed from storage
       */
      toBeDeletedTool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId, {
        disablePersistence: true
      })
    }

    if (toBeDeletedTool) {
      /**
       * Do nothing is tool already deleted
       */
      if (toBeDeletedTool.isDeleted) {
        void this.openLastActiveSession()
        return
      }

      /**
       * Remove session sequence from tool
       */
      await this.detachSessionSequence(toBeDeletedTool.toSession())

      /**
       * If state has been changed, insert into history and set isDeleted to true
       */
      const isAddedToHistory = sessionHistoryStore.addHistory(toBeDeletedTool)

      /**
       * If tool did not added to history, we can remove the entire data from storage
       */
      if (isAddedToHistory) {
        void toBeDeletedTool.markAsDeleted()
      } else {
        /**
         * Delay removing tool from storage because there are some case where tool properties
         * still updated (ex. saving last state of input / output components)
         */
        setTimeout(() => {
          void ToolStorageManager.removeToolStateFromStorage(toBeDeletedTool!.sessionId)
        }, 500)
      }
    }
  }

  /**
   * Push created tool session into list
   *
   * @param tool
   */
  pushIntoSessionList(tool: Session, placeSessionAtTheEnd: boolean = false) {
    if (this.placeNewSessionToLast || placeSessionAtTheEnd) {
      this.sessions.push(tool)
    } else {
      const activeTool = activeSessionStore.getActiveTool()

      const indexOfActiveTool = this.sessions.findIndex((session) => (
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

  /**
   * Get running sessions based on use preferences
   *
   * @param toolId
   * @returns
   */
  getRunningSessions(toolId: string) {
    if (this.unifiedToolSession) {
      return this.sessions
    }

    return this.getRunningSessionsFromTool(toolId)
  }

  /**
   * Switch index position of session
   *
   * @param fromSessionId
   * @param toSessionId
   */
  switchSessionPosition(fromSessionId: string, toSessionId: string) {
    const fromIndex = this.sessions.findIndex((session) => session.sessionId === fromSessionId)
    const toIndex = this.sessions.findIndex((session) => session.sessionId === toSessionId)

    // Remove the item from the original index
    const removedItem = this.sessions.splice(fromIndex, 1)[0]

    // Insert the removed item at the new index
    this.sessions.splice(toIndex, 0, removedItem)
  }

  /**
   *
   * @param toolSession
   * @param newSessionName
   */
  async renameSession(toolSession: Session, newSessionName: string) {
    await this.detachSessionSequence(toolSession)

    /**
     * Set session name to actual tool
     */
    const retrievedTool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)
    if (retrievedTool) {
      retrievedTool.setSessionName(newSessionName)
      retrievedTool.setSessionSequenceNumber(undefined)
      await retrievedTool.hydrateStore()
    }

    /**
     * Set session name to tool session and replace in session list
     */
    toolSession.sessionName = newSessionName
    this.replaceToolSession(toolSession)
  }

  replaceToolSession(toolSession: Session) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === toolSession.sessionId)
    this.sessions[sessionIndex] = toolSession
  }
}

export const sessionStore = new SessionStore()
