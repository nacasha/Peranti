import { type listOfInputComponent } from "src/components/inputs"

import { type InputComponentProps } from "./InputComponentProps.js"

type ExtractInputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof InputComponentProps> : never

export type ToolInput<K extends Record<string, string> = any> = {
  /**
   * Field name that will be used as key in map of input
   */
  key: keyof K

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
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Text>
} | {
  component: "TextArea"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.TextArea>
} | {
  component: "Switch"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Switch>
} | {
  component: "Run"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Run>
} | {
  component: "Checkbox"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Checkbox>
} | {
  component: "Select"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Select>
} | {
  component: "File"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.File>
} | {
  component: "Code"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Code>
})
