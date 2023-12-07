import { type listOfInputComponent } from "src/components/Input"

export interface ToolInput {
  /**
   * Field name that will be used as key in map of input
   */
  key: string

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
}
