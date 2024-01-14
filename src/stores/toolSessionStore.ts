import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolHistory } from "src/types/ToolHistory.js"

import { toolHistoryStore } from "./toolHistoryStore.js"
import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolStore } from "./toolStore.js"

class ToolSessionStore {
  keepToolSession = true

  sessions: Tool[] = []

  lastToolSessionIds: Record<string, string> = {}

  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolSessionStore",
      properties: [
        "keepToolSession",
        "lastToolSessionIds",
        {
          key: "sessions",
          serialize: (sessions: this["sessions"]) => {
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
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param toolConstructor
   */
  findOrCreateSession(toolConstructor: ToolConstructor) {
    const tool = new Tool(toolConstructor)
    const existingToolSessions = this.getSessionsFromTool(tool)

    this.saveActiveToolToHistory()
    this.saveActiveToolLastSessionId()

    /**
     * Create new if there is no existing sessions
     */
    if (existingToolSessions.length === 0) {
      toolRunnerStore.openTool(tool)
      this.addSession(tool)

    /**
     * Restore last sessions of tool
     */
    } else {
      const lastToolSessionId = this.lastToolSessionIds[tool.toolId]
      const lastToolSession = existingToolSessions.find(
        (toolSession) => toolSession.sessionId === lastToolSessionId
      ) ?? existingToolSessions[0]

      toolRunnerStore.openTool(lastToolSession)
    }
  }

  /**
   * Create new session and set as active tool
   *
   * @param toolConstructor
   */
  createSessionAndOpen(toolConstructor: ToolConstructor) {
    const tool = new Tool(toolConstructor)
    this.addSession(tool)
    this.setLastSessionIdOfTool(tool)
    toolRunnerStore.openTool(tool)
  }

  setLastSessionIdOfTool(tool: Tool) {
    this.lastToolSessionIds[tool.toolId] = tool.sessionId
  }

  /**
   * Save tool to history when tool has been running at least once
   * and not an instance of tool history
   */
  private saveActiveToolToHistory() {
    const activeTool = toolRunnerStore.getActiveTool()

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
  private saveActiveToolLastSessionId() {
    const activeTool = toolRunnerStore.getActiveTool()

    if (!this.keepToolSession) {
      const filteredSessions = this.sessions.filter((session) => session.toolId !== activeTool.toolId)
      this.sessions = filteredSessions
    } else {
      this.setLastSessionIdOfTool(activeTool)
    }
  }

  /**
   * Push created tool session into list
   *
   * @param tool
   */
  addSession(tool: Tool) {
    this.sessions.push(tool)
  }

  /**
   * Get all sessions of tool
   *
   * @param tool
   * @returns
   */
  getSessionsFromTool(tool: Tool) {
    return this.sessions.filter((session) => session.toolId === tool.toolId)
  }
}

export const toolSessionStore = new ToolSessionStore()
