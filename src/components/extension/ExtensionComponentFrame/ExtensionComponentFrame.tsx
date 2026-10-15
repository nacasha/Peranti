import { type FC, type MouseEventHandler } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"

import { type ExtensionComponentBridgeOptions, useExtensionComponentBridge } from "./useExtensionComponentBridge.js"

import "./ExtensionComponentFrame.scss"

type BridgeOptions = Omit<ExtensionComponentBridgeOptions, "fieldProps" | "readOnly" | "isRunning">

interface ExtensionComponentFrameProps extends BridgeOptions {
  label?: string
  readOnly?: boolean

  /**
   * Whether the field's tool is running, shown by the component through
   * `peranti.running`
   */
  isRunning?: boolean

  /**
   * The layout sizes the field by its content, a `min-content` row: the frame
   * is as tall as the content it reports. Anywhere else it fills its place.
   */
  fitContent?: boolean

  /**
   * Shows the maximize button, from `maximizable` in `peranti.component.json`
   */
  maximizable?: boolean

  onContextMenu?: MouseEventHandler<HTMLDivElement>

  /**
   * Every other prop is one of the field's "props" from its tool, handed to
   * the component as is
   */
  [prop: string]: unknown
}

/**
 * A field drawn by an extension's HTML, in a sandboxed frame with no origin:
 * it can't reach the app, its storage, Tauri or the network. It only exchanges
 * JSON with the app through messages, see `useExtensionComponentBridge`.
 */
export const ExtensionComponentFrame: FC<ExtensionComponentFrameProps> = (props) => {
  const {
    html,
    mode,
    fieldKey,
    componentKey,
    label,
    value,
    readOnly = false,
    isRunning = false,
    fitContent = false,
    maximizable = false,
    initialState,
    onContextMenu,
    onValueChange,
    onStateChange,
    onHeightChange,
    onDebugEvent,
    onRun,
    ...fieldProps
  } = props

  const { frameRef, frameDocument, contentHeight, actions, sendAction } = useExtensionComponentBridge({
    html,
    mode,
    fieldKey,
    componentKey,
    value,
    readOnly,
    isRunning,
    fieldProps,
    initialState,
    onValueChange,
    onStateChange,
    onHeightChange,
    onDebugEvent,
    onRun
  })

  return (
    <div className="ExtensionComponentFrame" style={{ gridArea: fieldKey }} onContextMenu={onContextMenu}>
      <AppletComponentHead showMaximize={maximizable} label={label} actions={actions} onAction={sendAction} />
      <div className="ExtensionComponentFrame-body" style={fitContent ? { height: contentHeight } : undefined}>
        <iframe
          ref={frameRef}
          title={label ?? fieldKey}
          // Scripts only: no same origin, forms, popups or top navigation
          sandbox="allow-scripts"
          srcDoc={frameDocument}
        />
      </div>
    </div>
  )
}
