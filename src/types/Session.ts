export interface Session {

  toolId: string

  sessionId: string

  sessionName?: string

  sessionSequenceNumber?: number

  isActionRunning?: boolean

  isKeepAlive?: boolean
}
