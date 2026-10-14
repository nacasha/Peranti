import { appletComponentService } from "src/services/applet-component-service"
import { type ComponentValueInfo } from "src/types/ComponentValueInfo"

/**
 * What a tool field's value is, from the component it names: a built-in
 * one, or `@<id>` of the extension's own components. Undefined when unknown.
 */
export function getFieldValueInfo(
  component: string,
  mode: "input" | "output",
  extensionComponents: Array<{ componentId: string, value?: ComponentValueInfo }> = []
): ComponentValueInfo | undefined {
  if (component.startsWith("@")) {
    const extensionComponent = extensionComponents.find((item) => item.componentId === component.slice(1))
    if (!extensionComponent) {
      return undefined
    }
    return extensionComponent.value ?? { type: "any" }
  }

  const components = (mode === "input" ? appletComponentService.inputs : appletComponentService.outputs) as
    Record<string, { value?: ComponentValueInfo } | undefined>

  return components[component]?.value
}
