import { type ToolComponent } from "src/models/ToolComponent.ts"
import { type toolComponentService } from "src/services/toolComponentService.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractInputComponentProps<T> = T extends ToolComponent<React.FC<infer P>>
  ? Omit<P, keyof InputComponentProps>
  : never

export type ToolInput<K extends Record<string, string> = any> = {
  /**
   * Input field key
   */
  key: Extract<keyof K, string>

  /**
   * Label of field
   */
  label: string

  /**
   * Default value of input
   */
  defaultValue: any

  /**
   * Allow this field to have batch mode
   */
  allowBatch?: boolean

  /**
   * Skip this field's value when determining tool has inputValues or not
   */
  skipValidateHasValue?: boolean
} & ({
  component: "Text"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.Text>
} | {
  component: "TextArea"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.TextArea>
} | {
  component: "Switch"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.Switch>
} | {
  component: "Run"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.Run>
} | {
  component: "Checkbox"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.Checkbox>
} | {
  component: "Select"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.Select>
} | {
  component: "File"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.File>
} | {
  component: "Code"
  props?: ExtractInputComponentProps<typeof toolComponentService.inputs.Code>
})
