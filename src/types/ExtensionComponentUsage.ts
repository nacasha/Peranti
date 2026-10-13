/**
 * A tool field that uses an extension component
 */
export interface ExtensionComponentUsage {
  toolName: string
  fieldKey: string
  fieldLabel?: string
  mode: "input" | "output"
  defaultValue?: unknown
  props?: Record<string, unknown>
}
