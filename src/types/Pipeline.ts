export interface Pipeline {
  appletId: string
  fields: Array<{
    inputKey: string
    previousOutputKey?: string
    key?: string
  }>
}
