import { useCallback } from "react"

import { type Applet } from "src/models/Applet"
import { extensionComponentRegistry } from "src/services/extension-component-registry"
import { isFieldContentSized } from "src/utils/applet/is-field-content-sized"

import { useSelector } from "./useSelector.js"

interface ExtensionFieldOptions {
  applet: Applet
  type: "input" | "output"
  fieldKey: string

  /**
   * The component the field names
   */
  component: string

  /**
   * What the component last saved with `peranti.setState`
   */
  initialState: unknown
  onStateChange: (state: unknown) => void

  /**
   * Batch mode or a maximized field, which lay fields out side by side
   */
  isSideBySide: boolean
}

/**
 * Props an extension component's field needs from its tab, or undefined when
 * the field isn't an extension component
 */
export function useExtensionFieldProps(options: ExtensionFieldOptions) {
  const { applet, type, fieldKey, component, initialState, onStateChange, isSideBySide } = options

  const isExtensionComponent = extensionComponentRegistry.isExtensionComponent(component)
  const isRunning = useSelector(() => isExtensionComponent && applet.isActionRunning)

  // `peranti.run(values)`: runs this tab's tool, after the run that is going
  const onRun = useCallback(async(runValues: Record<string, unknown>) => {
    await applet.runWhenIdle(runValues)
  }, [applet])

  if (!isExtensionComponent) {
    return undefined
  }

  return {
    initialState,
    onStateChange,
    onRun,
    isRunning,

    // Follows its content only where the layout sizes the field by it,
    // anywhere else it fills its place
    fitContent: isFieldContentSized(applet.layoutSetting, type, fieldKey, isSideBySide)
  }
}
