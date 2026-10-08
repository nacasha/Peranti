import { toJS } from "mobx"
import { type FC } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { AppletComponentContext } from "src/contexts/AppletInputContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { type AppletOutput } from "src/types/AppletOutput"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"

interface AppletOutputRendererProps {
  appletOutput: AppletOutput

  /**
   * KeyValue fields rendered together as one card, `appletOutput` is the first of them
   */
  groupedOutputs?: AppletOutput[]
}

export const AppletOutputRenderer: FC<AppletOutputRendererProps> = (props) => {
  const { appletOutput, groupedOutputs } = props
  const { show } = useContextMenu()

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())

  /**
   * Rendered field state
   */
  const outputValue = useSelector(() => {
    if (!groupedOutputs) {
      return activeApplet.outputValues[appletOutput.key] ?? ""
    }

    return Object.fromEntries(
      groupedOutputs.map((output) => [output.key, activeApplet.outputValues[output.key] ?? ""])
    )
  })
  const initialState = activeApplet.outputFieldsState[appletOutput.key]

  /**
   * Batch mode state
   */
  const isBatchModeEnabled = useSelector(() => activeApplet.isBatchModeEnabled)
  const batchModeOutputKey = useSelector(() => activeApplet.batchModeOutputKey)

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeApplet.maximizedField)

  /**
   * Component to be rendered
   */
  const outputComponent = appletComponentService.getOutputComponent(appletOutput.component, isBatchModeEnabled)
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

  /**
   * Pass `initialState` related props to selected components
   * Only few components handling those events
   */
  const additionalProps: Record<string, any> = {}
  if (["Code", "Mermaid", "Image", "Pintora"].includes(appletOutput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (maximizedField.enabled && maximizedField.type === "output" && maximizedField.key !== appletOutput.key) {
    return
  }

  /**
   * Batch mode shows only the selected output, unless this output is the maximized one
   */
  const isMaximizedOutput = maximizedField.enabled &&
    maximizedField.type === "output" &&
    maximizedField.key === appletOutput.key

  if (isBatchModeEnabled && batchModeOutputKey !== appletOutput.key && !isMaximizedOutput) {
    return
  }

  /**
   * Each grouped field becomes one row, labelled with the field label
   */
  if (groupedOutputs) {
    additionalProps.fields = Object.fromEntries(
      groupedOutputs.map((output) => [output.key, { label: output.label }])
    )
  }
  const label = groupedOutputs && appletOutput.component === "KeyValue"
    ? appletOutput.props?.label
    : appletOutput.label

  return (
    <AppletComponentContext.Provider value={{
      type: "output",
      fieldKey: appletOutput.key,
      component: outputComponent,
      showRegenerateButton: appletOutput.showRegenerateButton
    }}
    >
      <Component
        {...appletOutput.props}
        key={appletOutput.key}
        fieldKey={appletOutput.key}
        label={label}
        value={outputValue}
        onContextMenu={handleContextMenu}
        {...additionalProps}
      />
    </AppletComponentContext.Provider>
  )
}
