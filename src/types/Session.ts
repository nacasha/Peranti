export interface Session {
  appletId: string
  sessionId: string
  sessionName?: string
  sessionSequenceNumber?: number
  isActionRunning?: boolean
  isKeepAlive?: boolean
}
