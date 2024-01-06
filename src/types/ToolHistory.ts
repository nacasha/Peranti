export interface ToolHistory {
  instanceId: string
  toolId: string
  inputParams: any
  outputParams: any
  inputOutputHash: string
  isBatchEnabled: boolean
  batchInputKey: string | number | symbol
  batchOutputKey: string | number | symbol
  createdAt: number
}
