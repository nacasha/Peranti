import { type ComponentValueInfo } from "src/types/ComponentValueInfo"

import { checkComponentProps } from "./check-component-props.js"
import { checkComponentValue } from "./check-component-value.js"

/**
 * The first problem with a value against its documented type and structure:
 * the keys of an object, or the type and keys of each item of an array.
 * Undefined when it fits.
 */
export function checkComponentValueStructure(value: unknown, info: ComponentValueInfo): string | undefined {
  const typeProblem = checkComponentValue(value, info.type)
  if (typeProblem !== undefined) {
    return typeProblem
  }
  if (value === null || value === undefined) {
    return undefined
  }

  if (info.type === "object" && info.fields && typeof value === "object" && !Array.isArray(value)) {
    return checkComponentProps(value as Record<string, unknown>, info.fields)
  }

  if (info.type === "array" && Array.isArray(value)) {
    const itemType = info.itemType ?? (info.fields ? "object" : undefined)

    for (const [index, item] of value.entries()) {
      if (itemType) {
        const itemProblem = checkComponentValue(item, itemType)
        if (itemProblem) {
          return `Item ${index}: ${itemProblem}`
        }
      }
      if (info.fields && item && typeof item === "object" && !Array.isArray(item)) {
        const fieldProblem = checkComponentProps(item as Record<string, unknown>, info.fields)
        if (fieldProblem) {
          return `Item ${index}: ${fieldProblem}`
        }
      }
    }
  }

  return undefined
}
