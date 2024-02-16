export interface AppletSample<InputFields = any> {
  name: string
  inputValues: Partial<InputFields> | (() => Partial<InputFields>)
  isBatchModeEnabled?: boolean
}
