import type toast from "react-hot-toast"

export interface AppletActionParams<InputFields, OptionKeys> {
  inputValues: InputFields
  toast: typeof toast
  options: OptionKeys
}

export type AppletActionReturn<OutputFields> = {
  type: "output" | "toast"
} & {
  type: "output"
  data: OutputFields
}
