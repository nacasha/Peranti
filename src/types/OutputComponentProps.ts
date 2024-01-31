export interface OutputComponentProps<T = string> {
  /**
   * Label of field
   */
  label?: string

  /**
   * Value output of field
   */
  value?: T

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
}
