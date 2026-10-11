import { type ComputedProp } from "src/types/AppletInput"

/**
 * Prop values from their raw sources, run through each computed prop's `transform`
 */
export function transformComputedProps(
  computedProps: Record<string, ComputedProp | undefined>,
  sources: Record<string, any>
) {
  const values: Record<string, any> = {}
  for (const [prop, source] of Object.entries(sources)) {
    const transform = computedProps[prop]?.transform
    values[prop] = transform ? transform(source ?? "") : source
  }
  return values
}
