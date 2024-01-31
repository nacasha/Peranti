export interface ToolState {
  sessionId: string
  sessionName?: string
  sessionSequenceNumber?: number
  toolId: string
  inputValues: any
  outputValues: any
  isBatchEnabled: boolean
  batchInputKey: string | number | symbol
  batchOutputKey: string | number | symbol
  createdAt: number
  runCount: number
  isOutputValuesModified: boolean
  isInputValuesModified: boolean
  isDeleted: boolean
  inputFieldsState: Record<string, any>
  outputFieldsState: Record<string, any>
}
