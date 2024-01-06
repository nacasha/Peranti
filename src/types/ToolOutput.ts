import { type listOfOutputComponent } from "src/components/outputs"

export interface ToolOutput<K extends Record<string, any> = any> {
  /**
   * Field name that will be used as key in output map to show the value
   */
  key: keyof K

  /**
   * Label of field
   */
  label: string

  /**
   * Component to render output
   */
  component: keyof typeof listOfOutputComponent

  /**
   * Properties that will be passed into component
   */
  props?: Record<string, string>

  /**
   * Allow this field as batch operations
   */
  allowBatch?: boolean
}
