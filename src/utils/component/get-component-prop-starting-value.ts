import { type ComponentPropInfo } from "src/types/ComponentPropInfo"

const EMPTY_BY_TYPE: Record<string, unknown> = {
  string: "",
  number: 0,
  boolean: false,
  "json-string": "[]",
  object: {},
  array: []
}

/**
 * Value a prop gets when added in the playground: its example, else its
 * default, else its first option, else an empty value of its type
 */
export function getComponentPropStartingValue(info: ComponentPropInfo): unknown {
  return info.example ?? info.default ?? info.options?.[0] ?? EMPTY_BY_TYPE[info.type] ?? null
}
