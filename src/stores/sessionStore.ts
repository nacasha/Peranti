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
  isInitialized: boolean = false

  enableMultipleSession = true

  closeToolWhenLastSessionIsClosed = true

  unifiedToolSession = true

  placeNewSessionToLast = false

  sessions: Session[] = []

  runningTools: Record<string, Tool | undefined> = {}

  sessionSequences: Record<string, boolean[]> = {}

  activeSessionIdOfTools: Record<string, string> = {}

  activeSessionId: string = ""

  constructor() {
    makeAutoObservable(this)
  }

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

  async handleHydratedStore() {
    await this.openLastActiveSession()
    this.setIsInitialized(true)
  }

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

  private setIsInitialized(value: boolean) {
    this.isInitialized = value
  }

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

  createSession(
    toolConstructor: ToolConstructor,
    toolOptions: ConstructorParameters<typeof Tool>["1"] = {},
    placeSessionAtTheEnd: boolean = false
  ) {
    if (toolConstructor.toolId === "") {
      return
    }

    if (toolConstructor.disableMultipleSession) {
      if (this.getRunningSessionsFromTool(toolConstructor.toolId).length > 0) {
        return
      }
    }

    const newOptions: typeof toolOptions = {
      ...toolOptions,
      initialState: toolOptions?.initialState ?? {}
    }

    if (newOptions.initialState && !newOptions.initialState?.sessionName) {
      newOptions.initialState.sessionSequenceNumber = this.attachSessionSequence(toolConstructor.toolId)
    }

    const tool = new Tool(toolConstructor, newOptions)

    this.pushIntoSessionList(tool.toSession(), placeSessionAtTheEnd)
    this.activateTool(tool)
    return tool
  }

  findOrCreateSession(toolConstructor: ToolConstructor) {
    const runningSessions = this.getRunningSessionsFromTool(toolConstructor.toolId)

    if (runningSessions.length === 0) {
      this.createSession(toolConstructor)
    } else {
      const activeTool = activeSessionStore.getActiveTool()
      const lastToolSessionId = this.activeSessionIdOfTools[toolConstructor.toolId]

      if (activeTool.sessionId === lastToolSessionId) {
        return
      }

      const lastToolSession = runningSessions.find(
        (toolSession) => toolSession.sessionId === lastToolSessionId
      )

      void this.openSession(lastToolSession ?? runningSessions[0])
    }
  }

  async openSession(toolSession: Session) {
    const activeTool = activeSessionStore.getActiveTool()

    if (activeTool.sessionId === toolSession.sessionId) {
      return
    }

    const tool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)
    if (tool) {
      this.activateTool(tool)
    }
  }

  async openSessionId(sessionId: string) {
    const activeTool = activeSessionStore.getActiveTool()

    if (activeTool.sessionId === sessionId) {
      return
    }

    const tool = await ToolStorageManager.getToolFromStorage(sessionId)
    if (tool) {
      this.activateTool(tool)
    }
  }

  async openHistory(toolHistory: SessionHistory) {
    const tool = await ToolStorageManager.getToolFromStorage(toolHistory.sessionId)

    if (tool) {
      const isDeleted = false
      const sessionSequenceNumber = !tool.sessionName
        ? this.attachSessionSequence(toolHistory.toolId)
        : undefined

      tool.setIsDeleted(isDeleted)
      tool.setSessionSequenceNumber(sessionSequenceNumber)

      this.pushIntoSessionList(tool.toSession(), true)
      activeSessionStore.setActiveTool(tool)
      this.setActiveToolSessionId(tool)
    }
  }

  activateTool(tool: Tool) {
    const activeTool = activeSessionStore.getActiveTool()

    if (activeTool.sessionId === tool.sessionId) {
      return
    }

    void this.deactivateTool(activeTool)

    activeSessionStore.setActiveTool(tool)
    this.setActiveToolSessionId(tool)
  }

  private async deactivateTool(tool: Tool) {
    if (tool.isActionRunning) {
      this.runningTools[tool.sessionId] = tool
    } else {
      if (this.runningTools[tool.sessionId]) {
        this.runningTools[tool.sessionId] = undefined
      }
    }
  }

  private removeSessionBySessionId(sessionId: string) {
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

  async closeSession(toolSession: Session, skipOpenAnotherSession: boolean = false) {
    const activeTool = activeSessionStore.getActiveTool()

    const closedSessionIndex = this.removeSessionBySessionId(toolSession.sessionId)

    if (!skipOpenAnotherSession && (activeTool.sessionId === toolSession.sessionId)) {
      const newSessionsOfTool = this.getRunningSessions(toolSession.toolId)

      if (newSessionsOfTool.length === 0) {
        this.resetToolSessionSequence(toolSession.toolId)

        if (this.closeToolWhenLastSessionIsClosed) {
          this.activateTool(Tool.empty())
        } else {
          const toolConstructor = toolStore.mapOfLoadedTools[toolSession.toolId]
          this.createSession(toolConstructor)
        }
      } else if (closedSessionIndex > -1) {
        let newSessionToBeOpened
        if (closedSessionIndex <= newSessionsOfTool.length - 1) {
          newSessionToBeOpened = newSessionsOfTool[closedSessionIndex]
        } else {
          newSessionToBeOpened = newSessionsOfTool[closedSessionIndex - 1]
        }

        void this.openSession(newSessionToBeOpened)
      }
    }

    if (activeTool.sessionId === toolSession.sessionId) {
      await this.proceedCloseSession({ tool: activeTool })
    } else {
      await this.proceedCloseSession({ toolSession })
    }
  }

  closeAllSession() {
    this.sessions.forEach((session) => {
      void this.closeSession(session, true)
    })

    this.sessions = []

    this.sessionSequences = {}

    this.activateTool(Tool.empty())
  }

  async closeOtherSession(toolSession: Session) {
    this.sessions.forEach((session) => {
      if (session.sessionId !== toolSession.sessionId) {
        void this.closeSession(session, true)
      }
    })

    this.sessions = [toolSession]

    this.sessionSequences = {}
    this.sessionSequences[toolSession.toolId] = [true]
    if (toolSession.sessionSequenceNumber) {
      this.sessionSequences[toolSession.toolId][toolSession.sessionSequenceNumber] = true
    }

    const tool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)
    if (tool) {
      this.activateTool(tool)
    }
  }

  resetToolSessionSequence(toolId: string) {
    this.sessionSequences[toolId] = [true]
  }

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

    if (nextIndex === 1) {
      const runningSessions = this.getRunningSessionsFromTool(toolId)

      if (runningSessions.length === 1 && runningSessions[0].sessionSequenceNumber === nextIndex) {
        this.sessionSequences[toolId][1] = true
        nextIndex = nextIndex + 1
      }
    }

    this.sessionSequences[toolId][nextIndex] = true
    return nextIndex
  }

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

  setActiveToolSessionId(tool: Session) {
    this.activeSessionIdOfTools[tool.toolId] = tool.sessionId
    this.activeSessionId = tool.sessionId
  }

  private async proceedCloseSession(options: { toolSession?: Session, tool?: Tool }) {
    const { toolSession, tool } = options
    let toBeDeletedTool: Tool | undefined

    if (tool) {
      toBeDeletedTool = tool

      toBeDeletedTool.stopStore()
    } else if (toolSession) {
      toBeDeletedTool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId, {
        disablePersistence: true
      })
    }

    if (toBeDeletedTool) {
      if (toBeDeletedTool.isDeleted) {
        void this.openLastActiveSession()
        return
      }

      await this.detachSessionSequence(toBeDeletedTool.toSession())

      const isAddedToHistory = sessionHistoryStore.addHistory(toBeDeletedTool)

      if (isAddedToHistory) {
        void toBeDeletedTool.markAsDeleted()
      } else {
        setTimeout(() => {
          void ToolStorageManager.removeToolStateFromStorage(toBeDeletedTool!.sessionId)
        }, 500)
      }
    }
  }

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

  getRunningSessionsFromTool(toolId: string) {
    return this.sessions.filter((session) => session.toolId === toolId)
  }

  getRunningSessions(toolId: string) {
    if (this.unifiedToolSession) {
      return this.sessions
    }

    return this.getRunningSessionsFromTool(toolId)
  }

  switchSessionPosition(fromSessionId: string, toSessionId: string) {
    const fromIndex = this.sessions.findIndex((session) => session.sessionId === fromSessionId)
    const toIndex = this.sessions.findIndex((session) => session.sessionId === toSessionId)

    // Remove the item from the original index
    const removedItem = this.sessions.splice(fromIndex, 1)[0]

    // Insert the removed item at the new index
    this.sessions.splice(toIndex, 0, removedItem)
  }

  async renameSession(toolSession: Session, newSessionName: string) {
    await this.detachSessionSequence(toolSession)

    const retrievedTool = await ToolStorageManager.getToolFromStorage(toolSession.sessionId)
    if (retrievedTool) {
      retrievedTool.setSessionName(newSessionName)
      retrievedTool.setSessionSequenceNumber(undefined)
      await retrievedTool.hydrateStore()
    }

    toolSession.sessionName = newSessionName
    this.replaceToolSession(toolSession)
  }

  replaceToolSession(toolSession: Session) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === toolSession.sessionId)
    this.sessions[sessionIndex] = toolSession
  }
}

export const sessionStore = new SessionStore()
