import Fuse from "fuse.js"
import { makeAutoObservable, observable, reaction } from "mobx"

import settingsApplet from "src/applets/pages/settings-applet.ts"
import { type Session } from "src/types/Session.ts"
import { extractSearchableText } from "src/utils/extract-searchable-text.ts"
import { getMatchExcerpt } from "src/utils/get-match-excerpt.ts"
import { getSessionDisplayName } from "src/utils/get-session-display-name.ts"

import { activeAppletStore } from "./active-applet-store.ts"
import { appletStore } from "./applet-store.js"
import { interfaceStore } from "./interface-store.ts"
import { sessionHistoryStore } from "./session-history-store.ts"
import { sessionStore } from "./session-store.ts"
import { StorageManager } from "./storage-manager.ts"

export interface CommandbarTool {
  key: string
  appletId: string
  label: string
  category: string
  description?: string
}

export interface CommandbarCommand {
  key: string
  label: string
  run: () => unknown
}

export interface CommandbarTab {
  key: string
  session: Session
  label: string
  appletName: string

  /**
   * Excerpt of the tab inputs, set only when the match came from the inputs
   */
  excerpt?: string
}

export interface CommandbarResults {
  tabs: CommandbarTab[]
  tools: CommandbarTool[]
  commands: CommandbarCommand[]
}

export type CommandbarFilter = "all" | "tabs" | "tools" | "commands"

const FUSE_OPTIONS = { threshold: 0.35, ignoreLocation: true }

class CommandbarService {
  isOpen: boolean = false

  tools: CommandbarTool[] = []

  commands: CommandbarCommand[] = []

  /**
   * Bumped whenever the tab content index changes so observers re-run the search
   */
  tabIndexVersion: number = 0

  /**
   * Lowercased input text of each open tab, keyed by sessionId.
   * Non-active tabs cannot be edited, so an entry stays valid until its tab
   * is activated again (see `setupTabIndexInvalidation`).
   */
  private readonly tabContents = new Map<string, string>()

  private toolsFuse = new Fuse<CommandbarTool>([], FUSE_OPTIONS)

  private commandsFuse = new Fuse<CommandbarCommand>([], FUSE_OPTIONS)

  private isTabIndexInvalidationReady = false

  constructor() {
    makeAutoObservable<this, "tabContents" | "toolsFuse" | "commandsFuse">(this, {
      tools: observable.ref,
      commands: observable.ref,
      tabContents: false,
      toolsFuse: false,
      commandsFuse: false
    })
  }

  toggleOpen() {
    this.setIsOpen(!this.isOpen)
  }

  setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen

    if (isOpen) {
      void this.refreshTabIndex()
    }
  }

  open() {
    this.setIsOpen(true)
  }

  close() {
    this.setIsOpen(false)
  }

  setupItems() {
    const applets = appletStore.listOfLoadedApplets

    this.tools = applets.map((applet) => ({
      key: "tool:".concat(applet.appletId),
      appletId: applet.appletId,
      label: applet.name,
      category: applet.category,
      description: applet.description
    }))

    this.commands = this.createCommands()

    this.toolsFuse = new Fuse(this.tools, { ...FUSE_OPTIONS, keys: ["label", "category", "description"] })
    this.commandsFuse = new Fuse(this.commands, { ...FUSE_OPTIONS, keys: ["label"] })

    this.setupTabIndexInvalidation()
  }

  /**
   * Drop the cached content of a tab once it is deactivated, it may have been
   * edited while active. Set up lazily because session store is not ready at
   * construction time (circular imports between stores).
   */
  private setupTabIndexInvalidation() {
    if (this.isTabIndexInvalidationReady) return
    this.isTabIndexInvalidationReady = true

    reaction(
      () => sessionStore.activeSessionId,
      (_, previousSessionId) => {
        this.tabContents.delete(previousSessionId)
      }
    )
  }

  /**
   * Load input values of every open tab into the search index.
   * Only tabs missing from the cache are read from storage, the active tab is
   * always read from memory since it is the only one that can change.
   */
  async refreshTabIndex() {
    const activeApplet = activeAppletStore.getActiveApplet()
    const openSessionIds = new Set(sessionStore.sessions.map((session) => session.sessionId))

    for (const sessionId of this.tabContents.keys()) {
      if (!openSessionIds.has(sessionId)) {
        this.tabContents.delete(sessionId)
      }
    }

    await Promise.all(sessionStore.sessions.map(async({ sessionId }) => {
      if (sessionId === activeApplet.sessionId) {
        this.tabContents.set(sessionId, extractSearchableText(activeApplet.inputValues))
        return
      }

      if (this.tabContents.has(sessionId)) return

      const runningApplet = sessionStore.runningApplets[sessionId]
      const inputValues = runningApplet
        ? runningApplet.inputValues
        : (await StorageManager.getAppletStateFromStorage(sessionId))?.inputValues

      this.tabContents.set(sessionId, extractSearchableText(inputValues))
    }))

    this.bumpTabIndexVersion()
  }

  private bumpTabIndexVersion() {
    this.tabIndexVersion = this.tabIndexVersion + 1
  }

  /**
   * A keyword starting with ">" always searches commands, whatever the filter.
   * "all" lists tabs and tools, and adds commands only once something is typed.
   */
  search(keyword: string, filter: CommandbarFilter = "all"): CommandbarResults {
    const isCommandKeyword = keyword.startsWith(">")
    const query = (isCommandKeyword ? keyword.slice(1) : keyword).trim()
    const activeFilter = isCommandKeyword ? "commands" : filter

    const includes = (group: CommandbarFilter) => activeFilter === "all" || activeFilter === group

    return {
      tabs: includes("tabs") ? this.searchTabs(query) : [],
      tools: includes("tools")
        ? (query ? this.toolsFuse.search(query).map((r) => r.item) : this.tools)
        : [],
      commands: activeFilter === "commands"
        ? (query ? this.commandsFuse.search(query).map((r) => r.item) : this.commands)
        : (activeFilter === "all" && query ? this.commandsFuse.search(query).map((r) => r.item) : [])
    }
  }

  /**
   * Plain substring search, every word of the query has to appear in either
   * the tab name, its tool name, or its inputs. Tabs matched by name rank first.
   */
  private searchTabs(query: string): CommandbarTab[] {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    const matchedByName: CommandbarTab[] = []
    const matchedByContent: CommandbarTab[] = []

    for (const session of sessionStore.sessions) {
      const label = getSessionDisplayName(session) ?? ""
      const appletName = appletStore.mapOfLoadedAppletsName[session.appletId] ?? ""
      const tab: CommandbarTab = { key: "tab:".concat(session.sessionId), session, label, appletName }

      if (tokens.length === 0) {
        matchedByName.push(tab)
        continue
      }

      const title = `${label} ${appletName}`.toLowerCase()
      const content = this.tabContents.get(session.sessionId) ?? ""
      let excerpt = ""
      let isMatch = true

      for (const token of tokens) {
        if (title.includes(token)) continue

        if (content.includes(token)) {
          if (!excerpt) excerpt = getMatchExcerpt(content, token)
          continue
        }

        isMatch = false
        break
      }

      if (!isMatch) continue

      if (excerpt) {
        matchedByContent.push({ ...tab, excerpt })
      } else {
        matchedByName.push(tab)
      }
    }

    return matchedByName.concat(matchedByContent)
  }

  private createCommands(): CommandbarCommand[] {
    return [
      {
        key: "cmd:new-tab",
        label: "New Tab",
        run: () => { sessionStore.createSessionOfActiveApplet() }
      },
      {
        key: "cmd:close-tab",
        label: "Close Tab",
        run: async() => { await sessionStore.closeSessionOfActiveApplet() }
      },
      {
        key: "cmd:reopen-closed-tab",
        label: "Reopen Closed Tab",
        run: async() => { await sessionHistoryStore.restoreLastHistory() }
      },
      {
        key: "cmd:rename-tab",
        label: "Rename Tab",
        run: () => { sessionStore.setRenamingSessionIdOfActiveApplet() }
      },
      {
        key: "cmd:toggle-group-tabs",
        label: "Toggle Group Tabs By Tool",
        run: () => { sessionStore.toggleGroupTabsByTool() }
      },
      {
        key: "cmd:toggle-sidebar",
        label: "Toggle Sidebar",
        run: () => { interfaceStore.toggleSidebar() }
      },
      {
        key: "cmd:open-settings",
        label: "Open Settings",
        run: () => { sessionStore.findOrCreateSession(settingsApplet) }
      }
    ]
  }

  openTool(appletId: string) {
    const appletConstructor = appletStore.mapOfLoadedApplets[appletId]
    if (appletConstructor) {
      sessionStore.findOrCreateSession(appletConstructor)
    }
  }
}

export const commandbarService = new CommandbarService()
