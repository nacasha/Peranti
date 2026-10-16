import { type ExtensionComponentKind } from "src/types/ExtensionComponent"
import { type ExtensionComponentMode } from "src/types/ExtensionComponentMessage"

export const ExtensionComponentKindLabels: Record<ExtensionComponentKind, string> = {
  input: "Input",
  output: "Output",
  both: "Input & Output"
}

/**
 * Every kind a `peranti.component.json` may declare
 */
export const ExtensionComponentKinds = Object.keys(ExtensionComponentKindLabels) as ExtensionComponentKind[]

/**
 * Kind of a component that declares none: usable as an input and an output
 */
export const DEFAULT_EXTENSION_COMPONENT_KIND: ExtensionComponentKind = "both"

/**
 * The two ways a field component is used, inputs first
 */
export const FieldModes: readonly ExtensionComponentMode[] = ["input", "output"]
