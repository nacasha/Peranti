import { ComponentValueTypes } from "src/constants/component-value-types"

/**
 * What is wrong with a component's `props` list as written in its
 * `peranti.component.json`, or undefined when it is fine
 */
export function getComponentPropsDefinitionError(props: unknown): string | undefined {
  if (!Array.isArray(props)) {
    return "\"props\" must be a list of { name, type }"
  }

  const names = new Set<string>()

  for (const [index, prop] of props.entries()) {
    if (!prop || typeof prop !== "object" || typeof prop.name !== "string" || !prop.name) {
      return `"props[${index}].name" is required`
    }
    if (names.has(prop.name)) {
      return `prop "${prop.name}" is listed twice`
    }
    names.add(prop.name)

    if (!ComponentValueTypes.includes(prop.type) || ["file", "files"].includes(prop.type)) {
      return `prop "${prop.name}": "type" must be one of ${ComponentValueTypes.filter((type) => type !== "file" && type !== "files").join(", ")}`
    }
    if (prop.options !== undefined && !Array.isArray(prop.options)) {
      return `prop "${prop.name}": "options" must be a list`
    }
  }

  return undefined
}
