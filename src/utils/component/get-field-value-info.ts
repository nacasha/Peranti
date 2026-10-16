import { appletComponentService } from "src/services/applet-component-service"
import { type ComponentValueInfo } from "src/types/ComponentValueInfo"
import { parseComponentReference } from "src/utils/extension/extension-ids"

/**
 * What a tool field's value is, from the component it names: a built-in
 * one, or `@<id>` of the extension's own components. Undefined when unknown.
 */
export function getFieldValueInfo(
  component: string,
  mode: "input" | "output",
  extensionComponents: Array<{ componentId: string, value?: ComponentValueInfo }> = []
): ComponentValueInfo | undefined {
  const componentId = parseComponentReference(component)
  if (componentId !== undefined) {
    const extensionComponent = extensionComponents.find((item) => item.componentId === componentId)
    if (!extensionComponent) {
      return undefined
    }
    return extensionComponent.value ?? { type: "any" }
  }

  const components = (mode === "input" ? appletComponentService.inputs : appletComponentService.outputs) as
    Record<string, { value?: ComponentValueInfo } | undefined>

  return components[component]?.value
}
