import { comparer, toJS } from "mobx"
import { type FC, memo, useCallback, useMemo } from "react"
import { useContextMenu } from "react-contexify"

import { FileDropTarget } from "src/components/filedrop/FileDropTarget"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { AppletComponentContext } from "src/contexts/AppletComponentContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { extensionComponentRegistry } from "src/services/extension-component-registry"
import { fileDropService } from "src/services/file-drop-service"
import { type AppletInput, type ComputedProp } from "src/types/AppletInput"
import { type InputComponentProps } from "src/types/InputComponentProps"
import { isFieldContentSized } from "src/utils/applet/is-field-content-sized"
import { readComputedPropSources } from "src/utils/component/read-computed-prop-sources"
import { transformComputedProps } from "src/utils/component/transform-computed-props"

interface AppletInputRendererProps {
  appletInput: AppletInput
}

/**
 * Stable fallback, so fields without computed props keep the same memo inputs
 */
const noComputedProps: Record<string, ComputedProp | undefined> = {}

export const AppletInputRenderer: FC<AppletInputRendererProps> = memo((props) => {
  const { appletInput } = props
  const { show } = useContextMenu()

  const activeApplet = activeAppletStore.getActiveApplet()

  /**
   * Rendered field state
   */
  const inputValue = useSelector(() => activeApplet.inputValues[appletInput.key] ?? appletInput.defaultValue)
  const computedProps: Record<string, ComputedProp | undefined> = appletInput.computedProps ?? noComputedProps
  const computedPropSources = useSelector(
    () => readComputedPropSources(computedProps, activeApplet.inputValues),
    comparer.shallow
  )
  const computedPropValues = useMemo(
    () => transformComputedProps(computedProps, computedPropSources),
    [computedProps, computedPropSources]
  )
  const initialState = activeApplet.inputFieldsState[appletInput.key]
  const isDeleted = useSelector(() => activeApplet.isDeleted)
  const isHoveringFile = useSelector(() => fileDropService.isHoveringFile)

  /**
   * Batch mode state
   */
  const isBatchModeEnabled = useSelector(() => activeApplet.isBatchModeEnabled)
  const batchModeInputKey = useSelector(() => activeApplet.batchModeInputKey)

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeApplet.maximizedField)

  /**
   * Component to be rendered
   */
  const inputComponent = appletComponentService.getInputComponent(appletInput.component, isBatchModeEnabled)
  const Component: FC<InputComponentProps<any>> = inputComponent.component

  /**
   * Stable callbacks and context value, so typing in a field doesn't
   * re-render its head (label + buttons) or the other fields
   */
  const handleValueChange = useCallback((val: unknown) => {
    activeApplet.setInputValue(appletInput.key, val)
  }, [activeApplet, appletInput.key])

  const handleStateChange = useCallback((state: unknown) => {
    activeApplet.setInputFieldState(appletInput.key, state)
  }, [activeApplet, appletInput.key])

  const handleContextMenu = useCallback((event: any) => {
    if (isDeleted) {
      return
    }

    show({
      event,
      id: ContextMenuKeys.AppletComponent,
      props: {
        appletInput: toJS(appletInput),
        component: inputComponent
      }
    })
  }, [isDeleted, show, appletInput, inputComponent])

  const contextValue = useMemo(() => ({
    type: "input" as const,
    fieldKey: appletInput.key,
    component: inputComponent,
    showRegenerateButton: appletInput.showRegenerateButton,
    showBatchModeButton: appletInput.allowBatch,
    actions: appletInput.actions
  }), [appletInput.key, inputComponent, appletInput.showRegenerateButton, appletInput.allowBatch, appletInput.actions])

  /**
   * Pass `initialState` related props to selected components
   * Only few components handling those events
   */
  const additionalProps: Record<string, any> = {}
  if (["Code", "PipelineEditor", "Extensions", "ExtensionPage"].includes(appletInput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  // Extension components follow their content only where the layout sizes
  // the field by it, anywhere else they fill their place
  if (extensionComponentRegistry.isExtensionComponent(appletInput.component)) {
    additionalProps.fitContent = isFieldContentSized(
      activeApplet.layoutSetting,
      "input",
      appletInput.key,
      isBatchModeEnabled || maximizedField.enabled
    )
  }

  Object.assign(additionalProps, computedPropValues)

  if (maximizedField.enabled && maximizedField.type === "input" && maximizedField.key !== appletInput.key) {
    return
  }

  if (isBatchModeEnabled && batchModeInputKey !== appletInput.key) {
    return
  }

  return (
    <AppletComponentContext.Provider value={contextValue}>
      <Component
        {...appletInput.props}
        key={appletInput.key}
        fieldKey={appletInput.key}
        label={appletInput.label}
        value={inputValue}
        readOnly={isDeleted}
        onValueChange={handleValueChange}
        onContextMenu={handleContextMenu}
        {...additionalProps}
      />
      {isHoveringFile && !isDeleted && !!inputComponent.readFileAs && (
        <FileDropTarget fieldKey={appletInput.key} label={appletInput.label} />
      )}
    </AppletComponentContext.Provider>
  )
})
