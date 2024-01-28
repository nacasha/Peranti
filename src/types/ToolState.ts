export interface ToolState {
  sessionId: string
  sessionName?: string
  sessionSequenceNumber?: number
  toolId: string
  inputValues: any
  outputValues: any
  inputOutputHash: string
  isBatchEnabled: boolean
  batchInputKey: string | number | symbol
  batchOutputKey: string | number | symbol
  createdAt: number
  runCount: number
  isOutputValuesModified: boolean
  isInputValuesModified: boolean
}
