import { ExtensionRuntime } from "src/enums/extension-runtime"

export const ExtensionRuntimeLabels: Record<ExtensionRuntime, string> = {
  [ExtensionRuntime.JavaScript]: "JavaScript",
  [ExtensionRuntime.Executable]: "Executable"
}
