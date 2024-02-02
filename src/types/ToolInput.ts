import { type toolInputComponents } from "src/services/toolInputComponents.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractInputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof InputComponentProps> : never

export type ToolInput<K extends Record<string, string> = any> = {
  /**
   * Field name that will be used as key in map of input
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
   * Allow this field as batch operations
   */
  allowBatch?: boolean

  /**
   * Skip this field's value when determining tool has inputValues or not
   */
  skipValidateHasValue?: boolean
} & ({
  component: "Text"
  props?: ExtractInputComponentProps<typeof toolInputComponents.Text.component>
} | {
  component: "TextArea"
  props?: ExtractInputComponentProps<typeof toolInputComponents.TextArea.component>
} | {
  component: "Switch"
  props?: ExtractInputComponentProps<typeof toolInputComponents.Switch.component>
} | {
  component: "Run"
  props?: ExtractInputComponentProps<typeof toolInputComponents.Run.component>
} | {
  component: "Checkbox"
  props?: ExtractInputComponentProps<typeof toolInputComponents.Checkbox.component>
} | {
  component: "Select"
  props?: ExtractInputComponentProps<typeof toolInputComponents.Select.component>
} | {
  component: "File"
  props?: ExtractInputComponentProps<typeof toolInputComponents.File.component>
} | {
  component: "Code"
  props?: ExtractInputComponentProps<typeof toolInputComponents.Code.component>
})
