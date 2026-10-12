import { ExtensionRuntimeLabels } from "src/constants/extension-runtime-labels"
import { type ExtensionRuntime } from "src/enums/extension-runtime"

/**
 * Runtimes of an extension's tools for display, each listed once:
 * "JavaScript", or "JavaScript, Executable" for a mixed package
 */
export function getRuntimeSummary(runtimes: Array<ExtensionRuntime | undefined>): string | undefined {
  const labels = [...new Set(runtimes)]
    .filter((runtime): runtime is ExtensionRuntime => !!runtime && runtime in ExtensionRuntimeLabels)
    .map((runtime) => ExtensionRuntimeLabels[runtime])

  return labels.length > 0 ? labels.join(", ") : undefined
}
