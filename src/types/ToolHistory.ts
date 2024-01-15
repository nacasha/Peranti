export interface ToolHistory {
  sessionId: string
  sessionName?: string
  toolId: string
  inputValues: any
  outputValues: any
  inputOutputHash: string
  isBatchEnabled: boolean
  batchInputKey: string | number | symbol
  batchOutputKey: string | number | symbol
  createdAt: number
  runCount: number
}
