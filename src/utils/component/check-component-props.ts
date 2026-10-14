import { type ComponentPropInfo } from "src/types/ComponentPropInfo"

import { checkComponentValue } from "./check-component-value.js"

/**
 * The first problem with a field's props against what the component
 * documents, or undefined when they fit. Props it doesn't document pass,
 * built-in components take more than they list.
 */
export function checkComponentProps(props: Record<string, unknown>, infos: ComponentPropInfo[]): string | undefined {
  for (const info of infos) {
    const value = props[info.name]

    if (value === undefined) {
      if (info.required) {
        return `"${info.name}" is required`
      }
      continue
    }

    const typeProblem = checkComponentValue(value, info.type)
    if (typeProblem) {
      return `"${info.name}": ${typeProblem}`
    }

    if (info.options && !info.options.some((option) => JSON.stringify(option) === JSON.stringify(value))) {
      return `"${info.name}" must be one of ${info.options.map((option) => JSON.stringify(option)).join(", ")}`
    }
  }

  return undefined
}
