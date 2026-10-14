import { ComponentValueTypes } from "src/constants/component-value-types"

import { getComponentPropsDefinitionError } from "./get-component-props-definition-error.js"

/**
 * What is wrong with a component's `value` as written in its
 * `peranti.component.json`, or undefined when it is fine. Files can't cross
 * into a frame, so they aren't allowed.
 */
export function getComponentValueDefinitionError(value: unknown): string | undefined {
  const types = ComponentValueTypes.filter((type) => type !== "file" && type !== "files")

  if (!value || typeof value !== "object") {
    return "\"value\" must be an object with a \"type\""
  }

  const info = value as { type?: unknown, fields?: unknown, itemType?: unknown }

  if (!types.includes(info.type as never)) {
    return `"value.type" must be one of ${types.join(", ")}`
  }
  if (info.itemType !== undefined && !types.includes(info.itemType as never)) {
    return `"value.itemType" must be one of ${types.join(", ")}`
  }
  if (info.fields !== undefined) {
    const fieldsError = getComponentPropsDefinitionError(info.fields)
    if (fieldsError) {
      return `value.fields: ${fieldsError.replace(/"props/g, "\"fields").replace(/prop "/g, "field \"")}`
    }
  }

  return undefined
}
