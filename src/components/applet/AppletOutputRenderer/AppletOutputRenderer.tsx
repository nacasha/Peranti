import { comparer, toJS } from "mobx"
import { type FC, memo, useCallback, useMemo } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { AppletComponentContext } from "src/contexts/AppletComponentContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { extensionComponentRegistry } from "src/services/extension-component-registry"
import { type AppletOutput } from "src/types/AppletOutput"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"
import { isFieldContentSized } from "src/utils/applet/is-field-content-sized"
import { shallowEqualArrays } from "src/utils/common/shallow-equal-arrays"

interface AppletOutputRendererProps {
  appletOutput: AppletOutput

  /**
   * KeyValue fields rendered together as one card, `appletOutput` is the first of them
   */
  groupedOutputs?: AppletOutput[]
}

export const AppletOutputRenderer: FC<AppletOutputRendererProps> = memo((props) => {
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
  }, groupedOutputs ? comparer.shallow : comparer.default)
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

  /**
   * Stable callbacks and context value, so a new output value doesn't
   * re-render the field head (label + buttons)
   */
  const handleStateChange = useCallback((state: unknown) => {
    activeApplet.setOutputFieldState(appletOutput.key, state)
  }, [activeApplet, appletOutput.key])

  const handleContextMenu = useCallback((event: any) => {
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
  }, [activeApplet, show, appletOutput, outputComponent])

  const contextValue = useMemo(() => ({
    type: "output" as const,
    fieldKey: appletOutput.key,
    component: outputComponent,
    showRegenerateButton: appletOutput.showRegenerateButton,
    actions: appletOutput.actions
  }), [appletOutput.key, outputComponent, appletOutput.showRegenerateButton, appletOutput.actions])

  const fields = useMemo(() => groupedOutputs && Object.fromEntries(
    groupedOutputs.map((output) => [output.key, { label: output.label }])
  ), [groupedOutputs])

  /**
   * Pass `initialState` related props to selected components
   * Only few components handling those events
   */
  const additionalProps: Record<string, any> = {}
  if (["Code", "Mermaid", "Image", "Pintora", "DataGrid", "JsonTree"].includes(appletOutput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  // Extension components follow their content only where the layout sizes
  // the field by it, anywhere else they fill their place
  if (extensionComponentRegistry.isExtensionComponent(appletOutput.component)) {
    // What the component saved with `peranti.setState`, handed back when it opens again
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
    additionalProps.fitContent = isFieldContentSized(
      activeApplet.layoutSetting,
      "output",
      appletOutput.key,
      isBatchModeEnabled || maximizedField.enabled
    )
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
  if (fields) {
    additionalProps.fields = fields
  }
  const label = groupedOutputs && appletOutput.component === "KeyValue"
    ? appletOutput.props?.label
    : appletOutput.label

  return (
    <AppletComponentContext.Provider value={contextValue}>
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
}, (prevProps, nextProps) => (
  // `groupedOutputs` is rebuilt on every parent render, compare its items instead
  prevProps.appletOutput === nextProps.appletOutput &&
  shallowEqualArrays(prevProps.groupedOutputs, nextProps.groupedOutputs)
))
