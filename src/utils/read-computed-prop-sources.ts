import { type ComputedProp } from "src/types/AppletInput"

/**
 * Raw source value of each computed prop, keyed by prop name
 */
export function readComputedPropSources(
  computedProps: Record<string, ComputedProp | undefined>,
  inputValues: Record<string, any>
) {
  const sources: Record<string, any> = {}
  for (const [prop, computedProp] of Object.entries(computedProps)) {
    if (computedProp?.type === "input") {
      sources[prop] = inputValues[computedProp.key]
    }
  }
  return sources
}
