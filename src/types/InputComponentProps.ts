export interface InputComponentProps<T = string> {
  /**
   * Label to put on top of input component
   */
  label?: string

  /**
   * Initial value of input component
   */
  initialValue?: any

  /**
   * Handle input value changes
   *
   * @param value
   * @returns
   */
  onSubmit: (value: T) => any

  /**
   * Indicates component is read only
   */
  readOnly?: boolean
}
