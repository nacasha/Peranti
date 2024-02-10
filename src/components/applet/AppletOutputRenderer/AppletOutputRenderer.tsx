import { toJS } from "mobx"
import { type FC } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { componentService } from "src/services/component-manager"
import { type AppletOutput } from "src/types/AppletOutput"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"

interface AppletOutputRendererProps {
  appletOutput: AppletOutput
}

export const AppletOutputRenderer: FC<AppletOutputRendererProps> = (props) => {
  const { appletOutput } = props
  const { show } = useContextMenu()

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const outputValue = useSelector(() => activeApplet.outputValues[appletOutput.key] ?? "")
  const isBatchModeEnabled = useSelector(() => activeApplet.isBatchModeEnabled)
  const batchModeOutputKey = useSelector(() => activeApplet.batchModeOutputKey)

  const initialState = activeApplet.outputFieldsState[appletOutput.key]

  const outputComponent = componentService.getOutputComponent(appletOutput.component, isBatchModeEnabled)
  const Component: FC<OutputComponentProps<any>> = outputComponent.component

  const handleStateChange = (state: unknown) => {
    activeApplet.setOutputFieldState(appletOutput.key, state)
  }

  const handleContextMenu = (event: any) => {
    if (activeApplet.isDeleted) {
      return
    }

    show({
      event,
      id: ContextMenuKeys.AppletComponent,
      props: {
        appletOutput: toJS(appletOutput),
        component: outputComponent
      }
    })
  }

  const additionalProps: Record<string, any> = {}
  if (["Code", "Mermaid", "Image"].includes(appletOutput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (isBatchModeEnabled && batchModeOutputKey !== appletOutput.key) {
    return
  }

  return (
    <Component
      {...appletOutput.props}
      key={appletOutput.key}
      label={appletOutput.label}
      value={outputValue}
      onContextMenu={handleContextMenu}
      {...additionalProps}
    />
  )
}
