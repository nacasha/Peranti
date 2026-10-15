import { type ComponentPropInfo } from "src/types/ComponentPropInfo"

/**
 * Prop descriptions shared by several built-in components
 */

export const autoFocusProp: ComponentPropInfo = {
  name: "autoFocus",
  type: "boolean",
  default: false,
  description: "Focused when the tab opens"
}

export const placeholderProp: ComponentPropInfo = {
  name: "placeholder",
  type: "string",
  description: "Hint shown while empty",
  example: "Type here"
}

export const languageProp: ComponentPropInfo = {
  name: "language",
  type: "string",
  default: "plain",
  options: ["plain", "json", "javascript", "markdown", "yaml", "sql"],
  description: "Highlighting"
}

export const fileProps: ComponentPropInfo[] = [
  {
    name: "accept",
    type: "string",
    description: "File types to allow, like the HTML accept attribute",
    example: "image/*,.pdf"
  },
  {
    name: "maxSize",
    type: "number",
    description: "Largest file in bytes",
    example: 10485760
  }
]

/**
 * `options` of a component that picks one of a list, such as Select
 */
export function optionsProp(example: Array<{ label: string, value: string }>): ComponentPropInfo {
  return {
    name: "options",
    type: "array",
    required: true,
    description: "List of { label, value }, value is what the field sends",
    example
  }
}

/**
 * `items` of a list component, such as ListPick
 */
export function itemsProp(description: string): ComponentPropInfo {
  return {
    name: "items",
    type: "array",
    required: true,
    description,
    example: ["Apple", "Banana", "Cherry"]
  }
}
