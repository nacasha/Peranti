import { appletComponentService } from "src/services/applet-component-service"
import { type BuiltInComponentEntry } from "src/types/BuiltInComponentEntry"

/**
 * Every built-in field component by name, inputs and outputs of the same
 * name merged into one entry, sorted by name
 */
export function getBuiltInComponentEntries(): BuiltInComponentEntry[] {
  const inputs = appletComponentService.inputs as Record<string, BuiltInComponentEntry["input"]>
  const outputs = appletComponentService.outputs as Record<string, BuiltInComponentEntry["output"]>
  const names = [...new Set([...Object.keys(inputs), ...Object.keys(outputs)])]
    .filter((name) => !appletComponentService.isPageComponent(name))
    .sort((a, b) => a.localeCompare(b))

  return names.map((name) => {
    const input = inputs[name]
    const output = outputs[name]

    return {
      name,
      kind: input && output ? "both" : input ? "input" : "output",
      input,
      output
    }
  })
}
