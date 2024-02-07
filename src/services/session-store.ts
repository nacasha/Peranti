import { makeAutoObservable, toJS } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.ts"
import { Applet } from "src/models/Applet.ts"
import { StorageManager } from "src/services/storage-manager.ts"
import { type AppletConstructor } from "src/types/AppletConstructor.ts"
import { type Session } from "src/types/Session.ts"
import { type SessionHistory } from "src/types/SessionHistory.ts"

import { activeAppletStore } from "./active-applet-store.ts"
import { sessionHistoryStore } from "./session-history-store.ts"

class SessionStore {
  isInitialized: boolean = false

  enableMultipleSession = true

  unifiedSession = true

  placeNewSessionToLast = false

  sessions: Session[] = []

  runningApplets: Record<string, Applet | undefined> = {}

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
      const tool = await StorageManager.getAppletFromStorage(toolSession.sessionId)

      if (tool) {
        this.activateApplet(tool)
      }
    } else {
      this.activateApplet(Applet.empty())
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
    toolConstructor: AppletConstructor,
    toolOptions: ConstructorParameters<typeof Applet>["1"] = {},
    placeSessionAtTheEnd: boolean = false
  ) {
    if (toolConstructor.appletId === "") {
      return
    }

    if (toolConstructor.disableMultipleSession) {
      if (this.getRunningSessionsFromTool(toolConstructor.appletId).length > 0) {
        return
      }
    }

    const newOptions: typeof toolOptions = {
      ...toolOptions,
      initialState: toolOptions?.initialState ?? {}
    }

    if (newOptions.initialState && !newOptions.initialState?.sessionName) {
      newOptions.initialState.sessionSequenceNumber = this.attachSessionSequence(toolConstructor.appletId)
    }

    const tool = new Applet(toolConstructor, newOptions)

    this.pushIntoSessionList(tool.toSession(), placeSessionAtTheEnd)
    this.activateApplet(tool)
    return tool
  }

  findOrCreateSession(toolConstructor: AppletConstructor) {
    const runningSessions = this.getRunningSessionsFromTool(toolConstructor.appletId)

    if (runningSessions.length === 0) {
      this.createSession(toolConstructor)
    } else {
      const activeTool = activeAppletStore.getActiveApplet()
      const lastToolSessionId = this.activeSessionIdOfTools[toolConstructor.appletId]

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
    const activeTool = activeAppletStore.getActiveApplet()

    if (activeTool.sessionId === toolSession.sessionId) {
      return
    }

    const tool = await StorageManager.getAppletFromStorage(toolSession.sessionId)
    if (tool) {
      this.activateApplet(tool)
    }
  }

  async openSessionId(sessionId: string) {
    const activeTool = activeAppletStore.getActiveApplet()

    if (activeTool.sessionId === sessionId) {
      return
    }

    const tool = await StorageManager.getAppletFromStorage(sessionId)
    if (tool) {
      this.activateApplet(tool)
    }
  }

  async openHistory(sessionHistory: SessionHistory) {
    const applet = await StorageManager.getAppletFromStorage(sessionHistory.sessionId)

    if (applet) {
      const isDeleted = false
      const sessionSequenceNumber = !applet.sessionName
        ? this.attachSessionSequence(sessionHistory.toolId)
        : undefined

      applet.setIsDeleted(isDeleted)
      applet.setSessionSequenceNumber(sessionSequenceNumber)

      this.pushIntoSessionList(applet.toSession(), true)
      activeAppletStore.setActiveApplet(applet)
      this.setActiveSessionId(applet.appletId, applet.sessionId)
    }
  }

  activateApplet(applet: Applet) {
    const activeApplet = activeAppletStore.getActiveApplet()

    if (activeApplet.sessionId === applet.sessionId) {
      return
    }

    void this.deactivateTool(activeApplet)

    activeAppletStore.setActiveApplet(applet)
    this.setActiveSessionId(applet.appletId, applet.sessionId)
  }

  private async deactivateTool(tool: Applet) {
    if (tool.isActionRunning) {
      this.runningApplets[tool.sessionId] = tool
    } else {
      if (this.runningApplets[tool.sessionId]) {
        this.runningApplets[tool.sessionId] = undefined
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
    const activeTool = activeAppletStore.getActiveApplet()

    const closedSessionIndex = this.removeSessionBySessionId(toolSession.sessionId)

    if (!skipOpenAnotherSession && (activeTool.sessionId === toolSession.sessionId)) {
      const newSessionsOfTool = this.getRunningSessions(toolSession.appletId)

      if (newSessionsOfTool.length === 0) {
        this.resetToolSessionSequence(toolSession.appletId)
        this.activateApplet(Applet.empty())
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

    this.activateApplet(Applet.empty())
  }

  async closeOtherSession(toolSession: Session) {
    this.sessions.forEach((session) => {
      if (session.sessionId !== toolSession.sessionId) {
        void this.closeSession(session, true)
      }
    })

    this.sessions = [toolSession]

    this.sessionSequences = {}
    this.sessionSequences[toolSession.appletId] = [true]
    if (toolSession.sessionSequenceNumber) {
      this.sessionSequences[toolSession.appletId][toolSession.sessionSequenceNumber] = true
    }

    const tool = await StorageManager.getAppletFromStorage(toolSession.sessionId)
    if (tool) {
      this.activateApplet(tool)
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
    const sessions = this.sessionSequences[toolSession.appletId] ?? []
    const deletedIndex = sessions.findIndex(
      (_, index) => index === toolSession.sessionSequenceNumber
    )

    if (deletedIndex >= 0) {
      this.sessionSequences[toolSession.appletId][deletedIndex] = false
    }

    if (sessions.filter((e) => e).length === 1) {
      this.resetToolSessionSequence(toolSession.appletId)
    }

    await StorageManager.updateAppletStatePropertyInStorage(toolSession.sessionId, {
      sessionSequenceNumber: undefined
    })
  }

  setActiveSessionId(appletId: string, sessionId: string) {
    this.activeSessionIdOfTools[appletId] = sessionId
    this.activeSessionId = sessionId
  }

  private async proceedCloseSession(options: { toolSession?: Session, tool?: Applet }) {
    const { toolSession, tool } = options
    let toBeDeletedTool: Applet | undefined

    if (tool) {
      toBeDeletedTool = tool

      toBeDeletedTool.stopStore()
    } else if (toolSession) {
      toBeDeletedTool = await StorageManager.getAppletFromStorage(toolSession.sessionId, {
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
          void StorageManager.removeAppletStateFromStorage(toBeDeletedTool!.sessionId)
        }, 500)
      }
    }
  }

  pushIntoSessionList(tool: Session, placeSessionAtTheEnd: boolean = false) {
    if (this.placeNewSessionToLast || placeSessionAtTheEnd) {
      this.sessions.push(tool)
    } else {
      const activeTool = activeAppletStore.getActiveApplet()

      const indexOfActiveTool = this.sessions.findIndex((session) => (
        session.sessionId === activeTool.sessionId
      ))

      this.sessions.splice(indexOfActiveTool + 1, 0, tool)
    }
  }

  getRunningSessionsFromTool(toolId: string) {
    return this.sessions.filter((session) => session.appletId === toolId)
  }

  getRunningSessions(toolId: string) {
    if (this.unifiedSession) {
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

    const retrievedTool = await StorageManager.getAppletFromStorage(toolSession.sessionId)
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
