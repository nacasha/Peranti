import { ComponentValueTypeLabels } from "src/constants/component-value-types"
import { type ComponentValueType } from "src/types/ComponentValueInfo"

const describe = (value: unknown) => {
  if (value === null) return "null"
  if (Array.isArray(value)) return "an array"
  if (typeof value === "object") return "an object"
  return `a ${typeof value}`
}

/**
 * Why a value doesn't fit a component's value type, or undefined when it
 * does. `null` always fits, it is an empty field.
 */
export function checkComponentValue(value: unknown, type: ComponentValueType): string | undefined {
  if (value === null || type === "any" || type === "none") {
    return undefined
  }

  const expected = `Expected ${ComponentValueTypeLabels[type]}, got ${describe(value)}`

  switch (type) {
  case "string":
    return typeof value === "string" ? undefined : expected

  case "number":
    return typeof value === "number" ? undefined : expected

  case "boolean":
    return typeof value === "boolean" ? undefined : expected

  case "object":
    return typeof value === "object" && !Array.isArray(value) ? undefined : expected

  case "array":
    return Array.isArray(value) ? undefined : expected

  case "json-string": {
    if (typeof value !== "string") {
      return `${expected}. Write the JSON as text, such as JSON.stringify(rows)`
    }
    try {
      JSON.parse(value)
      return undefined
    } catch {
      return "Expected a JSON string, but the text isn't valid JSON"
    }
  }

  // Can't be typed as JSON at all
  case "file":
  case "files":
    return "Files can't be set from JSON, pick one in the component"
  }
}
