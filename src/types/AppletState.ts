import { type AppletFieldErrors } from "./AppletAction.ts"

export interface AppletState {
  appletId: string
  sessionId: string
  sessionName?: string
  sessionSequenceNumber?: number
  inputValues: any
  outputValues: any
  isBatchModeEnabled: boolean
  batchModeInputKey: string
  batchModeOutputKey: string
  createdAt: number
  actionRunCount: number
  isOutputValuesModified: boolean
  isInputValuesModified: boolean
  isDeleted: boolean
  inputFieldsState: Record<string, any>
  outputFieldsState: Record<string, any>

  /**
   * Errors badged on fields by the last run, optional for state saved before
   * they existed
   */
  fieldErrors?: AppletFieldErrors
  isAutoRunAndFirstTime: boolean
  optionValues: any
  viewMode: "main" | "pipeline"
  maximizedField: any
}
