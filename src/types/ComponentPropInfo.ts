import { type ComponentValueType } from "./ComponentValueInfo.ts"

/**
 * One prop a field component reads from its field's `props`, shown in the
 * component playground
 */
export interface ComponentPropInfo {
  name: string
  type: ComponentValueType
  description?: string

  /**
   * The component shows nothing useful without it
   */
  required?: boolean

  /**
   * What the component uses when the prop is left out
   */
  default?: unknown

  /**
   * Allowed values, for a prop that picks one of a few
   */
  options?: unknown[]

  /**
   * Filled in when the prop is added in the playground, falls back to `default`
   */
  example?: unknown
}
