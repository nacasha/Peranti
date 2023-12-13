import { type listOfOutputComponent } from "src/components/outputs"

export interface ToolOutput {
  /**
   * Field name that will be used as key in output map to show the value
   */
  key: string

  /**
   * Component to render output
   */
  component: keyof typeof listOfOutputComponent

  /**
   * Properties that will be passed into component
   */
  props?: Record<string, string>
}
