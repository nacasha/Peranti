export interface ToolOutput {
  /**
   * Field name that will be used as key in output map to show the value
   */
  field: string

  /**
   * Component to render output
   */
  component: string

  /**
   * Properties that will be passed into component
   */
  props?: Record<string, string>
}
