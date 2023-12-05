export interface BaseInputComponentProps<T = string> {
  /**
   * Handle input value changes
   *
   * @param value
   * @returns
   */
  onSubmit: (value: T) => any;

  /**
   * Initial value of input component
   */
  initialValue: string;
}
