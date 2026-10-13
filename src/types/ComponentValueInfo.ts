import { type ComponentPropInfo } from "./ComponentPropInfo.ts"

/**
 * Kinds of value a field component sends (input) or accepts (output).
 * "json-string" is JSON written as text, such as DataGrid rows.
 */
export type ComponentValueType =
  | "string"
  | "number"
  | "boolean"
  | "json-string"
  | "object"
  | "array"
  | "file"
  | "files"
  | "any"
  | "none"

/**
 * What a component's value is, shown in the component playground
 */
export interface ComponentValueInfo {
  type: ComponentValueType

  /**
   * What the value means, such as "Hex color"
   */
  description?: string
  example?: unknown

  /**
   * Structure: the keys of an object, or of each item of an array. Same
   * shape as a prop, `default` and `example` aren't used here.
   */
  fields?: ComponentPropInfo[]

  /**
   * Type of each item of an array, "object" when `fields` is given
   */
  itemType?: ComponentValueType
}
