export interface ToolSession {
  /**
   * Session ID
   */
  sessionId: string

  /**
   * Session name
   */
  sessionName: string

  /**
   * Tool ID of session
   */
  toolId: string

  /**
   * Indicates session is running an action
   */
  isActionRunning?: boolean

  /**
   * Keep session alive when change to another session
   */
  keepSession?: boolean
}
