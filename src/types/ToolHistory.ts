export interface ToolHistory {
  instanceId: string
  toolId: string
  inputValues: any
  outputValues: any
  inputOutputHash: string
  isBatchEnabled: boolean
  batchInputKey: string | number | symbol
  batchOutputKey: string | number | symbol
  createdAt: number
}
