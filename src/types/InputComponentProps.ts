export interface InputComponentProps<T = string> {
  /**
   * Label to put on top of input component
   */
  label?: string

  /**
   * Default value of input component
   */
  defaultValue?: any

  /**
   * Handle input value changes
   *
   * @param value
   * @returns
   */
  onSubmit: (value: T) => any

  /**
   * Initial state of component, such as selection, scroll position, edit history, etc.
   */
  initialState?: unknown

  /**
   * Event to capture state changes on component
   *
   * @param value
   * @returns
   */
  onStateChange?: (value: any) => void

  /**
   * Indicates component is read only
   */
  readOnly?: boolean
}
