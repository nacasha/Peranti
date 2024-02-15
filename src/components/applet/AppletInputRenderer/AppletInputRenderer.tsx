import { toJS } from "mobx"
import { type FC } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { type AppletInput } from "src/types/AppletInput"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface AppletInputRendererProps {
  appletInput: AppletInput
  readOnly?: boolean
}

export const AppletInputRenderer: FC<AppletInputRendererProps> = (props) => {
  const { readOnly, appletInput } = props
  const { show } = useContextMenu()

  const activeApplet = activeAppletStore.getActiveApplet()
  const defaultValue = activeApplet.inputValues[appletInput.key] ?? appletInput.defaultValue
  const initialState = activeApplet.inputFieldsState[appletInput.key]
  const isBatchModeEnabled = useSelector(() => activeApplet.isBatchModeEnabled)
  const batchModeInputKey = useSelector(() => activeApplet.batchModeInputKey)

  const inputComponent = appletComponentService.getInputComponent(appletInput.component, isBatchModeEnabled)
  const Component: FC<InputComponentProps<any>> = inputComponent.component

  const handleSUbmit = (val: unknown) => {
    activeApplet.setInputValue(appletInput.key, val)
  }

  const handleStateChange = (state: unknown) => {
    activeApplet.setInputFieldState(appletInput.key, state)
  }

  const handleContextMenu = (event: any) => {
    if (activeApplet.isDeleted) {
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
  }

  const additionalProps: Record<string, any> = {}
  if (["Code"].includes(appletInput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (isBatchModeEnabled && batchModeInputKey !== appletInput.key) {
    return
  }

  return (
    <Component
      {...appletInput.props}
      key={appletInput.key}
      label={appletInput.label}
      defaultValue={defaultValue}
      readOnly={readOnly}
      onSubmit={handleSUbmit}
      onContextMenu={handleContextMenu}
      {...additionalProps}
    />
  )
}
