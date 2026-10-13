import { type ComponentValueType } from "src/types/ComponentValueInfo"

/**
 * Every value type, with its label, in the order the docs list them
 */
export const ComponentValueTypeLabels: Record<ComponentValueType, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  "json-string": "JSON string",
  object: "object",
  array: "array",
  file: "File",
  files: "File[]",
  any: "any JSON",
  none: "no value"
}

export const ComponentValueTypes = Object.keys(ComponentValueTypeLabels) as ComponentValueType[]
