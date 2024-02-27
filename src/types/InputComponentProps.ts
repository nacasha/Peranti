/**
 * Base input component properties
 */
export interface InputComponentProps<T = string> {
  /**
   * Key to be passed into component
   * For now, it's used to give name for grid-area
   */
  fieldKey: string

  /**
   * Label of component
   */
  label?: string

  /**
   * Default value of component
   */
  defaultValue?: any

  /**
   * Event handler when value has been changed
   *
   * @param value
   * @returns
   */
  onValueChange: (value: T) => any

  /**
   * Initial state component (scroll position, selection, styling, etc)
   */
  initialState?: any

  /**
   * Mark component as readonly
   */
  readOnly?: boolean

  /**
   * Event handler when state of component changed
   *
   * @param value
   * @returns
   */
  onStateChange?: (value: any) => void

  /**
   * Context menu handler
   */
  onContextMenu?: any
}
