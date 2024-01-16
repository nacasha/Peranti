import { type listOfInputComponent } from "src/components/inputs"

import { type InputComponentProps } from "./InputComponentProps.js"

type ExtractInputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof InputComponentProps> : never

interface BaseInput<K extends Record<string, string> = any> {
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
}

interface ToolInputText<K extends Record<string, string> = any> extends BaseInput<K> {
  component: "Text"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Text>
}

interface ToolInputTextarea<K extends Record<string, string> = any> extends BaseInput<K> {
  component: "Textarea"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Textarea>
}

interface ToolInputSwitch<K extends Record<string, string> = any> extends BaseInput<K> {
  component: "Switch"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Switch>
}

interface ToolInputButton<K extends Record<string, string> = any> extends BaseInput<K> {
  component: "Button"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Button>
}

interface ToolInputCheckbox<K extends Record<string, string> = any> extends BaseInput<K> {
  component: "Checkbox"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Checkbox>
}

interface ToolInputSelect<K extends Record<string, string> = any> extends BaseInput<K> {
  component: "Select"
  props?: ExtractInputComponentProps<typeof listOfInputComponent.Select>
}

export type ToolInput<K extends Record<string, string> = any> =
  ToolInputText<K>
  | ToolInputTextarea<K>
  | ToolInputSwitch<K>
  | ToolInputButton<K>
  | ToolInputCheckbox<K>
  | ToolInputSelect<K>
