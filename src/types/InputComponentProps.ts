export interface InputComponentProps<T = string> {

  label?: string

  defaultValue?: any

  onSubmit: (value: T) => any

  initialState?: unknown

  readOnly?: boolean

  onStateChange?: (value: any) => void

  onContextMenu?: any
}
