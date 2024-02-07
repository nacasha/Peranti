import { type Component } from "src/models/Component.ts"
import { type componentService } from "src/services/component-manager.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractInputComponentProps<T> = T extends Component<React.FC<infer P>>
  ? Omit<P, keyof InputComponentProps>
  : never

export type AppletInput<K extends Record<string, string> = any> = {
  key: Extract<keyof K, string>
  label: string
  defaultValue: any
  allowBatch?: boolean
  skipValidateHasValue?: boolean
} & ({
  component: "Text"
  props?: ExtractInputComponentProps<typeof componentService.inputs.Text>
} | {
  component: "TextArea"
  props?: ExtractInputComponentProps<typeof componentService.inputs.TextArea>
} | {
  component: "Switch"
  props?: ExtractInputComponentProps<typeof componentService.inputs.Switch>
} | {
  component: "Run"
  props?: ExtractInputComponentProps<typeof componentService.inputs.Run>
} | {
  component: "Checkbox"
  props?: ExtractInputComponentProps<typeof componentService.inputs.Checkbox>
} | {
  component: "Select"
  props?: ExtractInputComponentProps<typeof componentService.inputs.Select>
} | {
  component: "File"
  props?: ExtractInputComponentProps<typeof componentService.inputs.File>
} | {
  component: "Code"
  props?: ExtractInputComponentProps<typeof componentService.inputs.Code>
})
