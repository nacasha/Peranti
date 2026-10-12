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
}
