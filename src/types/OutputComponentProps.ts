export interface OutputComponentProps<T = string> {
  fieldKey: string
  label?: string
  value?: T
  initialState?: any
  onStateChange?: (value: any) => void
  onContextMenu?: any
}
