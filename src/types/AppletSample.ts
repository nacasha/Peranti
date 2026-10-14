export interface AppletSample<InputFields = any> {
  name: string
  inputValues: Partial<InputFields> | (() => Partial<InputFields>)
  optionValues?: Record<string, unknown>
  isBatchModeEnabled?: boolean
}
