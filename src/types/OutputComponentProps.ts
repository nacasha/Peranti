export interface OutputComponentProps<T = string> {

  label?: string

  value?: T

  initialState?: unknown

  onStateChange?: (value: any) => void

  onContextMenu?: any
}
