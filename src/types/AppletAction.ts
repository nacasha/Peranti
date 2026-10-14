import type toast from "react-hot-toast"

export interface AppletActionParams<InputFields, OptionKeys, OutputFields = any> {
  inputValues: InputFields
  toast: typeof toast
  options: OptionKeys

  /**
   * Outputs of the previous run, so an action can keep its last good result
   * while an input is invalid. Empty in batch mode, where each line runs alone.
   */
  previousOutputValues: Partial<OutputFields>
}

/**
 * Errors shown as a badge on a field's card, by field key. Returned by an
 * action under `$errors`, beside its output values.
 */
export interface AppletFieldErrors {
  input?: Record<string, string>
  output?: Record<string, string>
}

export type AppletActionReturn<OutputFields> = {
  type: "output" | "toast"
} & {
  type: "output"
  data: OutputFields
}
