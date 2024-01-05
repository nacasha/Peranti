export interface ToolHistory {
  instanceId: string
  toolId: string
  inputParams: any
  outputParams: any
  isBatchEnabled: boolean
  batchInputKey: string
  batchOutputKey: string
  createdAt: number
}
