import { makeAutoObservable, toJS } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.ts"
import { AppletType } from "src/enums/applet-type.ts"
import { UserSettingsKeys } from "src/enums/user-settings-keys.ts"
import { Applet } from "src/models/Applet.ts"
import { type AppletConstructor } from "src/models/AppletConstructor.ts"
import { StorageManager } from "src/services/storage-manager.ts"
import { type Session } from "src/types/Session.ts"
import { type SessionHistory } from "src/types/SessionHistory.ts"

import { activeAppletStore } from "./active-applet-store.ts"
import { sessionHistoryStore } from "./session-history-store.ts"
import { userSettingsService } from "./user-settings-service.ts"

class SessionStore {
  isInitialized: boolean = false

  /**
   * By defaut, each tool can have multiple sessions at once
   * To disable this, need some works for restoring closed editor
   */
  enableMultipleSession = true

  /**
   * When enabled, only show running session in tabbar related to
   * active applet
   */
  @userSettingsService.watch(UserSettingsKeys.tabbarGroupTabsByTool)
  groupTabsByTool: boolean = userSettingsService.get(
    UserSettingsKeys.tabbarGroupTabsByTool,
    false
  )

  /**
   * Created session will be placed at most right tabbar
   */
  placeNewSessionToLast = false

  /**
   * List of session
   */
  sessions: Session[] = []

  /**
   * Map key value of session If and its applet instance
   */
  runningApplets: Record<string, Applet | undefined> = {}

  /**
   * Map key value of applet and its created session sequences
   */
  sessionSequences: Record<string, boolean[]> = {}

  /**
   * Map key value of applet and its all session Ids
   */
  activeSessionIdOfApplets: Record<string, string> = {}

  /**
   * Currently active session Id
   */
  activeSessionId: string = ""

  /**
   * Indicates session name are being renamed
   */
  renamingSessionId: string = ""

  /**
   * List of last activated session ids
   */
  lastActiveSessionIds: string[] = this.activeSessionId !== "" ? [this.activeSessionId] : []

  /**
   * List of sesion id popped from list lastActiveSessionids
   */
  indexOflastActiveSessionIds: number = 0

  constructor() {
    makeAutoObservable(this)
    userSettingsService.watchStore(this)
  }

  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.SessionStore,
      stringify: false,
      properties: [
        "sessionSequences",
        "activeSessionIdOfApplets",
        "activeSessionId",
        "sessions"
      ]
    }).then(() => {
      void this.handleHydratedStore()
    })
  }

  async handleHydratedStore() {
    await this.openCurrentlyActiveSession()
    this.setIsInitialized(true)
  }

  private setIsInitialized(value: boolean) {
    this.isInitialized = value
  }

  setSessionHasRunningAction(sessionId: string, value: boolean) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === sessionId)

    if (sessionIndex > -1) {
      this.sessions[sessionIndex] = {
        ...this.sessions[sessionIndex],
        isActionRunning: value,
        isKeepAlive: value
      }
    }
  }

  setRenamingSessionId(sessionId: string) {
    this.renamingSessionId = sessionId
  }

  setRenamingSessionIdOfActiveApplet() {
    const activeAppletSessionId = activeAppletStore.getActiveApplet().sessionId
    this.renamingSessionId = activeAppletSessionId
  }

  setGroupTabsByTool(value: boolean) {
    this.groupTabsByTool = value
  }

  toggleGroupTabsByTool() {
    this.groupTabsByTool = !this.groupTabsByTool
  }

  async openSessionBySessionId(sessionId: string, options: { saveToLastActiveSessionIds?: false } = {}) {
    const session = this.sessions.find((session) => session.sessionId === sessionId)

    if (session) {
      const applet = await StorageManager.getAppletFromStorage(session.sessionId)
      if (applet) {
        this.activateApplet(applet, options)
      }
    } else {
      this.activateApplet(Applet.empty(), { saveToLastActiveSessionIds: false })
    }
  }

  async openCurrentlyActiveSession() {
    await this.openSessionBySessionId(this.activeSessionId)
  }

  /**
   * Create new session / tab from active applet
   */
  createSessionOfActiveApplet() {
    const activeApplet = activeAppletStore.getActiveApplet()
    this.createSession(activeApplet)
  }

  /**
   * Create new session / tab using appletConstructor
   *
   * @param appletConstructor
   * @param appletOptions
   * @param placeSessionAtTheEnd
   * @returns
   */
  createSession(
    appletConstructor: AppletConstructor,
    appletOptions: ConstructorParameters<typeof Applet>["1"] = {},
    placeSessionAtTheEnd: boolean = false
  ) {
    if (appletConstructor.appletId === "") {
      return
    }

    /**
     * Exit process if below conditions is met
     * - Applet with type page can only have 1 session at time
     * - Multiple session is disabled
     */
    if (appletConstructor.type === AppletType.Page || !this.enableMultipleSession) {
      if (this.getRunningSessionsFromAppletId(appletConstructor.appletId).length > 0) {
        return
      }
    }

    const newOptions: typeof appletOptions = {
      ...appletOptions,
      initialState: appletOptions?.initialState ?? {}
    }

    if (newOptions.initialState && !newOptions.initialState?.sessionName) {
      newOptions.initialState.sessionSequenceNumber = this.attachSessionSequence(appletConstructor.appletId)
    }

    const applet = new Applet(appletConstructor, newOptions)

    this.pushIntoSessionList(applet.toSession(), placeSessionAtTheEnd)
    this.activateApplet(applet)
    return applet
  }

  findOrCreateSession(appletConstructor: AppletConstructor) {
    const runningSessions = this.getRunningSessionsFromAppletId(appletConstructor.appletId)

    if (runningSessions.length === 0) {
      this.createSession(appletConstructor)
    } else {
      const activeApplet = activeAppletStore.getActiveApplet()
      const lastSessionId = this.activeSessionIdOfApplets[appletConstructor.appletId]

      if (activeApplet.sessionId === lastSessionId) {
        return
      }

      const lastSession = runningSessions.find(
        (session) => session.sessionId === lastSessionId
      )

      void this.openSession(lastSession ?? runningSessions[0])
    }
  }

  async openSession(session: Session) {
    const activeApplet = activeAppletStore.getActiveApplet()

    if (activeApplet.sessionId === session.sessionId) {
      return
    }

    const applet = await StorageManager.getAppletFromStorage(session.sessionId)
    if (applet) {
      this.activateApplet(applet)
    }
  }

  /**
   * Open next session to index of active applet in running session list
   */
  openNextSessionOfActiveSession() {
    const activeIndex = this.getIndexofActiveRunningSession()
    const sessions = this.getRunningSessionOfActiveApplet()

    const nextActiveIndex = activeIndex + 1
    let session
    if (nextActiveIndex > sessions.length - 1) {
      session = sessions[0]
    } else {
      session = sessions[nextActiveIndex]
    }

    void sessionStore.openSession(session)
  }

  /**
   * Open previous session to index of active applet in running session list
   */
  openPreviousSessionOfActiveSession() {
    const activeIndex = this.getIndexofActiveRunningSession()
    const sessions = this.getRunningSessionOfActiveApplet()

    const nextActiveIndex = activeIndex - 1
    let session
    if (nextActiveIndex < 0) {
      session = sessions[sessions.length - 1]
    } else {
      session = sessions[nextActiveIndex]
    }

    void sessionStore.openSession(session)
  }

  /**
   * Open closed session and set active without adding it into session list
   *
   * @param sessionHistory
   */
  async openHistory(sessionHistory: SessionHistory) {
    const applet = await StorageManager.getAppletFromStorage(sessionHistory.sessionId)

    if (applet) {
      const isDeleted = false
      const sessionSequenceNumber = !applet.sessionName
        ? this.attachSessionSequence(sessionHistory.appletId)
        : undefined

      applet.setIsDeleted(isDeleted)
      applet.setSessionSequenceNumber(sessionSequenceNumber)

      this.pushIntoSessionList(applet.toSession(), true)
      activeAppletStore.setActiveApplet(applet)
      this.setActiveSessionId(applet.appletId, applet.sessionId, { saveToLastActiveSessionIds: false })
    }
  }

  async openPreviousLastActiveSession() {
    this.indexOflastActiveSessionIds++
    if (this.indexOflastActiveSessionIds > this.lastActiveSessionIds.length - 1) {
      this.indexOflastActiveSessionIds = this.lastActiveSessionIds.length - 1
    }

    const lastActiveSessionId = this.lastActiveSessionIds[this.indexOflastActiveSessionIds]

    if (lastActiveSessionId !== this.activeSessionId) {
      await this.openSessionBySessionId(lastActiveSessionId, { saveToLastActiveSessionIds: false })
    }
  }

  async openNextLastActiveSession() {
    this.indexOflastActiveSessionIds--
    if (this.indexOflastActiveSessionIds < 0) {
      this.indexOflastActiveSessionIds = 0
    }

    const lastActiveSessionId = this.lastActiveSessionIds[this.indexOflastActiveSessionIds]

    if (lastActiveSessionId !== this.activeSessionId) {
      await this.openSessionBySessionId(lastActiveSessionId, { saveToLastActiveSessionIds: false })
    }
  }

  activateApplet(applet: Applet, options: { saveToLastActiveSessionIds?: boolean } = {}) {
    const activeApplet = activeAppletStore.getActiveApplet()

    if (activeApplet.sessionId === applet.sessionId) {
      return
    }

    void this.deactivateApplet(activeApplet)

    activeAppletStore.setActiveApplet(applet)
    this.setActiveSessionId(applet.appletId, applet.sessionId, options)
  }

  private async deactivateApplet(applet: Applet) {
    if (applet.isActionRunning) {
      this.runningApplets[applet.sessionId] = applet
    } else {
      if (this.runningApplets[applet.sessionId]) {
        this.runningApplets[applet.sessionId] = undefined
      }
    }
  }

  private removeSessionFromSessionList(removedSession: Session) {
    let removedSessionIndex = -1

    /**
     * Get closed session index from its appletId only if unified session is disabled
     */
    if (this.groupTabsByTool) {
      removedSessionIndex = this.getRunningSessionsFromAppletId(removedSession.appletId).findIndex(
        (session) => session.sessionId === removedSession.sessionId
      )
    }

    /**
     * Filter session list while finding the closed session index if needed
     */
    this.sessions = this.sessions.filter((session, index) => {
      if (session.sessionId === removedSession.sessionId) {
        if (removedSessionIndex === -1) {
          removedSessionIndex = index
        }

        return false
      }
      return true
    })

    return removedSessionIndex
  }

  async closeSession(session: Session, skipOpenAnotherSession: boolean = false) {
    const activeApplet = activeAppletStore.getActiveApplet()
    const closedSessionIndex = this.removeSessionFromSessionList(session)

    /**
     * Open another session if the closed session if the currently active session
     */
    if (!skipOpenAnotherSession && (activeApplet.sessionId === session.sessionId)) {
      const newSessions = this.getRunningSessions(session.appletId)

      /**
       * Reset session sequence for related appletId
       * if the new sessions has empty list
       */
      if (newSessions.length === 0) {
        this.resetSessionSequence(session.appletId)
        this.activateApplet(Applet.empty(), { saveToLastActiveSessionIds: false })

      /**
       * Open another running session
       *
       * We need to check whether the closed session index is exist in the list (greater than -1)
       * If closed session is not found on list of session, it means closeSession()
       * was called more than once with same session, usually because holding
       * the hotkey to close the session
       */
      } else if (closedSessionIndex > -1) {
        let newSessionToBeOpened: Session

        /**
         * Open session exactly at the closed session index if the closed
         * session is placed at the most right in session list (right most tabbar)
         */
        if (closedSessionIndex <= newSessions.length - 1) {
          newSessionToBeOpened = newSessions[closedSessionIndex]

        /**
         * If closed session index is placed front or in the middle of session list
         */
        } else {
          newSessionToBeOpened = newSessions[closedSessionIndex - 1]
        }

        void this.openSession(newSessionToBeOpened)
      }
    }

    /**
     * Process to be closed session
     */
    if (activeApplet.sessionId === session.sessionId) {
      await this.proceedCloseSession({ applet: activeApplet })
    } else {
      await this.proceedCloseSession({ session })
    }
  }

  /**
   * Close session of currently active applet
   */
  async closeSessionOfActiveApplet() {
    const activeApplet = activeAppletStore.getActiveApplet()
    await this.closeSession(activeApplet.toSession())
  }

  closeAllSession() {
    /**
     * If unified session is enabled, we can directly close all session
     * and reset the session sequence
     */
    if (!this.groupTabsByTool) {
      this.sessions.forEach((session) => {
        void this.closeSession(session, true)
      })

      this.sessions = []
      this.sessionSequences = {}

    /**
     * If unified disabled, get currently active applet and remove
     * the others session with same appletId, as well as reset session
     * sequence for that appletId only
     */
    } else {
      const activeApplet = activeAppletStore.getActiveApplet()

      if (activeApplet.appletId !== "") {
        this.getRunningSessionsFromAppletId(activeApplet.appletId).forEach((session) => {
          void this.closeSession(session, true)
        })

        this.sessions = this.sessions.filter((session) => session.appletId !== activeApplet.appletId)
        this.sessionSequences[activeApplet.appletId] = [true]
      }
    }

    /**
     * Activate empty applet
     */
    this.activateApplet(Applet.empty(), { saveToLastActiveSessionIds: false })
  }

  async closeOtherSession(keepOpenSession: Session) {
    if (!this.groupTabsByTool) {
      this.sessions.forEach((session) => {
        if (session.sessionId !== keepOpenSession.sessionId) {
          void this.closeSession(session, true)
        }
      })

      this.sessions = [keepOpenSession]

      /**
       * Reset all session sequence regardless its appletId
       */
      this.sessionSequences = {}
    } else {
      const activeApplet = activeAppletStore.getActiveApplet()

      this.getRunningSessionsFromAppletId(activeApplet.appletId).forEach((session) => {
        if (session.sessionId !== keepOpenSession.sessionId) {
          void this.closeSession(session, true)
        }
      })
    }

    /**
     * Set initial session sequence for applet which has same appletId
     * as the keep opened one
     */
    this.sessionSequences[keepOpenSession.appletId] = [true]

    /**
     * If keep opened session has sequence number, mark as occupied by filling
     * the index with value `true` in session sequences
     */
    if (keepOpenSession.sessionSequenceNumber) {
      this.sessionSequences[keepOpenSession.appletId][keepOpenSession.sessionSequenceNumber] = true
    }

    const applet = await StorageManager.getAppletFromStorage(keepOpenSession.sessionId)
    if (applet) {
      this.activateApplet(applet)
    }
  }

  resetSessionSequence(appletId: string) {
    this.sessionSequences[appletId] = [true]
  }

  attachSessionSequence(appletId: string) {
    if (!this.sessionSequences[appletId]) {
      this.resetSessionSequence(appletId)
    }

    if (this.sessionSequences[appletId].length === 1) {
      this.sessionSequences[appletId][1] = true
      return 1
    }

    let nextIndex
    const sessionSequences = toJS(this.sessionSequences[appletId])
    const smallestIndex = sessionSequences.findIndex((e) => !e || e === undefined)

    if (smallestIndex === -1) {
      nextIndex = sessionSequences.length
    } else {
      nextIndex = smallestIndex
    }

    if (nextIndex === 1) {
      const runningSessions = this.getRunningSessionsFromAppletId(appletId)

      if (runningSessions.length === 1 && runningSessions[0].sessionSequenceNumber === nextIndex) {
        this.sessionSequences[appletId][1] = true
        nextIndex = nextIndex + 1
      }
    }

    this.sessionSequences[appletId][nextIndex] = true
    return nextIndex
  }

  async detachSessionSequence(session: Session) {
    const sessions = this.sessionSequences[session.appletId] ?? []
    const deletedIndex = sessions.findIndex(
      (_, index) => index === session.sessionSequenceNumber
    )

    if (deletedIndex >= 0) {
      this.sessionSequences[session.appletId][deletedIndex] = false
    }

    if (sessions.filter((e) => e).length === 1) {
      this.resetSessionSequence(session.appletId)
    }

    await StorageManager.updateAppletStatePropertyInStorage(session.sessionId, {
      sessionSequenceNumber: undefined
    })
  }

  setActiveSessionId(appletId: string, sessionId: string, options: { saveToLastActiveSessionIds?: boolean } = {}) {
    const { saveToLastActiveSessionIds = true } = options
    if (saveToLastActiveSessionIds && sessionId.trim() !== "") {
      /**
       * Reset index of last active session id because opening new session
       */
      if (this.indexOflastActiveSessionIds > 0) {
        this.lastActiveSessionIds = this.lastActiveSessionIds.slice(this.indexOflastActiveSessionIds)
      }

      this.lastActiveSessionIds.unshift(sessionId)
      this.indexOflastActiveSessionIds = 0

      /**
       * Remove history of lastActiveSessionIds that exceed 100 items
       */
      if (this.lastActiveSessionIds.length > 100) {
        this.lastActiveSessionIds = this.lastActiveSessionIds.slice(0, 100)
      }
    }

    this.activeSessionIdOfApplets[appletId] = sessionId
    this.activeSessionId = sessionId
  }

  private async proceedCloseSession(options: { session?: Session, applet?: Applet }) {
    const { session, applet } = options
    let toBeDeleted: Applet | undefined

    if (applet) {
      toBeDeleted = applet
      toBeDeleted.stopStore()
    } else if (session) {
      toBeDeleted = await StorageManager.getAppletFromStorage(session.sessionId, {
        disablePersistence: true
      })
    }

    if (toBeDeleted) {
      if (toBeDeleted.isDeleted) {
        void this.openCurrentlyActiveSession()
        return
      }

      await this.detachSessionSequence(toBeDeleted.toSession())

      const isAddedToHistory = sessionHistoryStore.addHistory(toBeDeleted)

      if (isAddedToHistory) {
        void toBeDeleted.markAsDeleted()
      } else {
        setTimeout(() => {
          void StorageManager.removeAppletStateFromStorage(toBeDeleted!.sessionId)
        }, 500)
      }

      /**
       * Remove entry from last active session ids
       */
      if (this.lastActiveSessionIds.includes(toBeDeleted.sessionId)) {
        this.lastActiveSessionIds = this.lastActiveSessionIds.filter((sessionId) => (
          sessionId !== toBeDeleted?.sessionId
        ))
      }
    }
  }

  pushIntoSessionList(session: Session, placeSessionAtTheEnd: boolean = false) {
    if (this.placeNewSessionToLast || placeSessionAtTheEnd) {
      this.sessions.push(session)
    } else {
      const activeApplet = activeAppletStore.getActiveApplet()
      const indexOfActiveSession = this.sessions.findIndex((session) => (
        session.sessionId === activeApplet.sessionId
      ))

      this.sessions.splice(indexOfActiveSession + 1, 0, session)
    }
  }

  /**
   * Get list of running sessios of applet
   *
   * @param appletId
   * @returns
   */
  getRunningSessionsFromAppletId(appletId: string) {
    return this.sessions.filter((session) => session.appletId === appletId)
  }

  /**
   * Get list of running sessions of applet based on groups tabs state
   */
  getRunningSessions(appletId: string) {
    if (this.groupTabsByTool) {
      return this.getRunningSessionsFromAppletId(appletId)
    }

    return this.sessions
  }

  /**
   * Get list of running session of active applet
   *
   * @returns
   */
  getRunningSessionOfActiveApplet() {
    const appletId = activeAppletStore.getActiveApplet().appletId
    return this.getRunningSessions(appletId)
  }

  /**
   * Get index of active running session
   *
   * @returns number
   */
  getIndexofActiveRunningSession() {
    const sessionId = activeAppletStore.getActiveApplet().sessionId
    return this.getRunningSessionOfActiveApplet().findIndex(
      (tab) => tab.sessionId === sessionId
    )
  }

  switchSessionPosition(fromSessionId: string, toSessionId: string) {
    const fromIndex = this.sessions.findIndex((session) => session.sessionId === fromSessionId)
    const toIndex = this.sessions.findIndex((session) => session.sessionId === toSessionId)

    // Remove the item from the original index
    const removedItem = this.sessions.splice(fromIndex, 1)[0]

    // Insert the removed item at the new index
    this.sessions.splice(toIndex, 0, removedItem)
  }

  async renameSession(session: Session, newSessionName: string) {
    await this.detachSessionSequence(session)

    const storedApplet = await StorageManager.getAppletFromStorage(session.sessionId)
    if (storedApplet) {
      storedApplet.setSessionName(newSessionName)
      storedApplet.setSessionSequenceNumber(undefined)
      await storedApplet.hydrateStore()
    }

    session.sessionName = newSessionName
    this.updateSession(session)
  }

  updateSession(updatedSession: Session) {
    const sessionIndex = this.sessions.findIndex((session) => session.sessionId === updatedSession.sessionId)
    this.sessions[sessionIndex] = updatedSession
  }
}

export const sessionStore = new SessionStore()
