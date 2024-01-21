export interface ToolSession {
  sessionId: string
  sessionName: string
  toolId: string
  isActionRunning?: boolean
  keepSession?: boolean
}
