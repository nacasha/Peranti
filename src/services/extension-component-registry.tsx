import { type FC } from "react"

import { ExtensionComponentFrame } from "src/components/extension/ExtensionComponentFrame"
import { ExtensionComponentMissing } from "src/components/extension/ExtensionComponentMissing"
import { AppletComponent } from "src/models/AppletComponent.js"
import { type ExtensionComponentKind } from "src/types/ExtensionComponent"
import { type ExtensionComponentMode } from "src/types/ExtensionComponentMessage"
import { type LoadedExtensionComponent } from "src/types/LoadedExtensionComponent"
import { isExtensionId } from "src/utils/extension/extension-ids"

const DEFAULT_KIND: ExtensionComponentKind = "both"

/**
 * Modes a component of each kind can be used in
 */
const MODES_BY_KIND: Record<ExtensionComponentKind, ExtensionComponentMode[]> = {
  input: ["input"],
  output: ["output"],
  both: ["input", "output"]
}

interface RegisteredComponent {
  loaded: LoadedExtensionComponent
  fields: Partial<Record<ExtensionComponentMode, AppletComponent>>
}

/**
 * Whether a reloaded component is the same as the one registered, so its
 * fields can be kept instead of remounted
 */
function isUnchanged(registered: RegisteredComponent | undefined, loaded: LoadedExtensionComponent) {
  return registered !== undefined &&
    registered.loaded.html === loaded.html &&
    JSON.stringify(registered.loaded.definition) === JSON.stringify(loaded.definition)
}

/**
 * A field component drawing `loaded` in a frame
 */
function createFieldComponent(loaded: LoadedExtensionComponent, mode: ExtensionComponentMode): AppletComponent {
  const { html, key, definition } = loaded
  const maximizable = definition.maximizable === true

  const Field: FC<Record<string, unknown> & { fieldKey: string }> = (props) => (
    <ExtensionComponentFrame {...props} mode={mode} html={html} componentKey={key} maximizable={maximizable} />
  )

  return new AppletComponent({
    component: Field,
    hideInHistory: true,
    maximizable,
    value: definition.value ?? { type: "any" },
    props: definition.props
  })
}

/**
 * Field components that loaded extensions provide, looked up by the
 * applet component service when a field names one
 */
class ExtensionComponentRegistry {
  private components = new Map<string, RegisteredComponent>()

  /**
   * Shown for a key that is no longer loaded
   */
  readonly missing = new AppletComponent({
    component: ExtensionComponentMissing,
    hideInHistory: true
  })

  /**
   * Replace every registered component with those of the loaded extensions.
   * Components that didn't change keep their field components, so their open
   * fields aren't remounted and don't lose their state.
   */
  setComponents(components: LoadedExtensionComponent[]) {
    const previous = this.components

    this.components = new Map(components.map((loaded) => {
      const registered = previous.get(loaded.key)
      if (isUnchanged(registered, loaded)) {
        return [loaded.key, registered!]
      }

      const modes = MODES_BY_KIND[loaded.definition.kind ?? DEFAULT_KIND]
      const fields = Object.fromEntries(modes.map((mode) => [mode, createFieldComponent(loaded, mode)]))

      return [loaded.key, { loaded, fields }]
    }))
  }

  isExtensionComponent(name: string) {
    return isExtensionId(name)
  }

  getInput(name: string) {
    return this.components.get(name)?.fields.input ?? this.missing
  }

  getOutput(name: string) {
    return this.components.get(name)?.fields.output ?? this.missing
  }
}

export const extensionComponentRegistry = new ExtensionComponentRegistry()
