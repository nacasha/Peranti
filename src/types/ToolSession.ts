export interface ToolSession {
  /**
   * Tool ID of session
   */
  toolId: string

  /**
   * Session ID
   */
  sessionId: string

  /**
   * Session name
   */
  sessionName?: string

  /**
   * Index of untitled session name
   */
  sessionSequenceNumber?: number

  /**
   * Indicates session is running an action
   */
  isActionRunning?: boolean

  /**
   * Keep session alive when change to another session
   */
  isKeepAlive?: boolean
}
