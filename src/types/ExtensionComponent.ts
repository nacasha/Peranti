import { type ComponentPropInfo } from "./ComponentPropInfo.ts"
import { type ComponentValueInfo } from "./ComponentValueInfo.ts"

/**
 * Where a component can be used: as an input field, an output field, or both
 */
export type ExtensionComponentKind = "input" | "output" | "both"

/**
 * Parsed `peranti.component.json`: a field drawn by the extension's own HTML,
 * shown in a sandboxed frame. Tools of the same extension use it as
 * `"component": "@<componentId>"`.
 */
export interface ExtensionComponent {
  /**
   * Its folder name in kebab case, set when it is read: the file has no ID
   */
  componentId: string
  name: string
  description?: string

  /**
   * HTML file relative to the `peranti.component.json`. Scripts and
   * stylesheets it links next to it are inlined when it loads.
   */
  entry: string

  /**
   * Defaults to "both"
   */
  kind?: ExtensionComponentKind

  /**
   * Height in pixels before the frame reports its own, defaults to 160
   */
  height?: number

  /**
   * What its value is, "any" JSON when left out
   */
  value?: ComponentValueInfo

  /**
   * Props it reads from `peranti.props`
   */
  props?: ComponentPropInfo[]
}
