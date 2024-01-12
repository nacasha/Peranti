import { type listOfInputComponent } from "src/components/inputs"

export interface ToolInput<K extends Record<string, string> = any> {
  /**
   * Field name that will be used as key in map of input
   */
  key: keyof K

  /**
   * Label of field
   */
  label: string

  /**
   * Component to render input
   */
  component: keyof typeof listOfInputComponent

  /**
   * Default value of input
   */
  defaultValue: any

  /**
   * Properties that will be passed into component
   */
  props?: Record<string, any>

  /**
   * Allow this field as batch operations
   */
  allowBatch?: boolean
}
