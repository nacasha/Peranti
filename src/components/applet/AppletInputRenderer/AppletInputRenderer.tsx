import { toJS } from "mobx"
import { type FC, memo, useCallback, useMemo } from "react"
import { useContextMenu } from "react-contexify"

import { FileDropTarget } from "src/components/filedrop/FileDropTarget"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { AppletComponentContext } from "src/contexts/AppletComponentContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { fileDropService } from "src/services/file-drop-service"
import { type AppletInput } from "src/types/AppletInput"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface AppletInputRendererProps {
  appletInput: AppletInput
}

export const AppletInputRenderer: FC<AppletInputRendererProps> = memo((props) => {
  const { appletInput } = props
  const { show } = useContextMenu()

  const activeApplet = activeAppletStore.getActiveApplet()

  /**
   * Rendered field state
   */
  const inputValue = useSelector(() => activeApplet.inputValues[appletInput.key] ?? appletInput.defaultValue)
  const sourceKey: string | undefined = appletInput.props?.sourceKey
  const sourceValue = useSelector(() => sourceKey ? activeApplet.inputValues[sourceKey] : undefined)
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
    showBatchModeButton: appletInput.allowBatch
  }), [appletInput.key, inputComponent, appletInput.showRegenerateButton, appletInput.allowBatch])

  /**
   * Pass `initialState` related props to selected components
   * Only few components handling those events
   */
  const additionalProps: Record<string, any> = {}
  if (["Code", "PipelineEditor"].includes(appletInput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (sourceKey) {
    additionalProps.sourceValue = sourceValue
  }

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
