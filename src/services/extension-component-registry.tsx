import { type FC } from "react"

import { ExtensionComponentFrame } from "src/components/extension/ExtensionComponentFrame"
import { ExtensionComponentMissing } from "src/components/extension/ExtensionComponentMissing"
import { AppletComponent } from "src/models/AppletComponent.js"
import { type InputComponentProps } from "src/types/InputComponentProps"
import { type LoadedExtensionComponent } from "src/types/LoadedExtensionComponent"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"

const DEFAULT_HEIGHT = 160

/**
 * Field components that loaded extensions provide, looked up by the
 * applet component service when a field names one. Kept apart from that
 * service so the extension loader doesn't import the whole component list.
 */
class ExtensionComponentRegistry {
  private inputs = new Map<string, AppletComponent>()
  private outputs = new Map<string, AppletComponent>()

  /**
   * Shown for a key that is no longer loaded
   */
  readonly missing = new AppletComponent({
    component: ExtensionComponentMissing,
    hideInHistory: true
  })

  /**
   * Replace every registered component with those of the loaded extensions
   */
  setComponents(components: LoadedExtensionComponent[]) {
    this.inputs = new Map()
    this.outputs = new Map()

    components.forEach((component) => {
      const kind = component.definition.kind ?? "both"
      const defaultHeight = component.definition.height ?? DEFAULT_HEIGHT

      if (kind !== "output") {
        const Input: FC<InputComponentProps<any>> = (props) => (
          <ExtensionComponentFrame {...props} mode="input" html={component.html} defaultHeight={defaultHeight} />
        )
        this.inputs.set(component.key, new AppletComponent({ component: Input, hideInHistory: true }))
      }

      if (kind !== "input") {
        const Output: FC<OutputComponentProps<any>> = (props) => (
          <ExtensionComponentFrame {...props} mode="output" html={component.html} defaultHeight={defaultHeight} />
        )
        this.outputs.set(component.key, new AppletComponent({ component: Output, hideInHistory: true }))
      }
    })
  }

  isExtensionComponent(name: string) {
    return name.startsWith("ext:")
  }

  getInput(name: string) {
    return this.inputs.get(name) ?? this.missing
  }

  getOutput(name: string) {
    return this.outputs.get(name) ?? this.missing
  }
}

export const extensionComponentRegistry = new ExtensionComponentRegistry()
