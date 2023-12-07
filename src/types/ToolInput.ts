export interface ToolInput {
  /**
   * Field name that will be used as key in map of input
   */
  field: string

  /**
   * Component to render input
   */
  component: string

  /**
   * Default value of input
   */
  defaultValue: any

  /**
   * Properties that will be passed into component
   */
  props?: Record<string, any>
}
