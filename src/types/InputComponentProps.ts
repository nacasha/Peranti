/**
 * Base input component properties
 */
export interface InputComponentProps<T = string> {
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
  onSubmit: (value: T) => any

  /**
   * Initial state component (scroll position, selection, styling, etc)
   */
  initialState?: unknown

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
