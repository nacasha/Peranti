import { useEffect, useMemo, useRef, useState, type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { useSelector } from "src/hooks/useSelector"
import { extensionComponentHeightStore } from "src/services/extension-component-height-store"
import { fileDropService } from "src/services/file-drop-service"
import { interfaceStore } from "src/services/interface-store"
import { type ExtensionComponentDebugEvent } from "src/types/ExtensionComponentDebugEvent"
import { toPlainJson } from "src/utils/data/to-plain-json"
import { buildExtensionComponentDocument } from "src/utils/extension/build-extension-component-document"
import { getExtensionComponentTheme } from "src/utils/extension/get-extension-component-theme"

import "./ExtensionComponentFrame.scss"

/**
 * Tallest the content can make the frame by itself, so a runaway layout
 * can't push the rest of the tool away
 */
const MAX_CONTENT_HEIGHT = 1600

interface ExtensionComponentFrameProps {
  fieldKey: string
  label?: string
  value?: unknown
  readOnly?: boolean
  mode: "input" | "output"

  /**
   * The layout sizes the field by its content, a `min-content` row: the frame
   * is as tall as the content it reports. Anywhere else it fills its place.
   */
  fitContent?: boolean

  /**
   * Component HTML with its assets inlined
   */
  html: string

  /**
   * Names the component, its last height is kept under it with the mode and
   * field key so the frame opens at that size
   */
  componentKey?: string
  onValueChange?: (value: unknown) => void
  onContextMenu?: any

  /**
   * Every message both ways, for the component playground
   */
  onDebugEvent?: (event: ExtensionComponentDebugEvent) => void

  /**
   * Height of the content, for the component playground
   */
  onHeightChange?: (height: number) => void

  /**
   * The field's "props" from its tool, handed to the component as is
   */
  [prop: string]: unknown
}

/**
 * A field drawn by an extension's HTML, in a frame with no origin: it can't
 * reach the app, its storage, Tauri or the network. It only exchanges JSON
 * values with the app through messages, see `ExtensionComponentBridge`, and
 * can ask to open files, which you then pick a tool for.
 */
export const ExtensionComponentFrame: FC<ExtensionComponentFrameProps> = (props) => {
  const {
    fieldKey,
    label,
    value,
    readOnly = false,
    mode,
    fitContent = false,
    html,
    componentKey,
    onValueChange,
    onContextMenu,
    onDebugEvent,
    onHeightChange,
    ...fieldProps
  } = props

  const frameRef = useRef<HTMLIFrameElement>(null)
  const isReadyRef = useRef(false)

  // Its natural size, only used where the layout sizes the field by its content.
  // Keyed by mode too, an input and an output may share a field key.
  const heightKey = componentKey && `${componentKey}#${mode}#${fieldKey}`
  const [contentHeight, setContentHeight] = useState(() => heightKey ? extensionComponentHeightStore.get(heightKey) : undefined)

  // The last value the frame sent, as JSON, so it isn't echoed straight back
  const valueFromFrameRef = useRef<string>()

  // Read through refs, the message listener is attached once
  const latestRef = useRef({ value, readOnly, heightKey, onValueChange, onDebugEvent, onHeightChange, fieldProps })
  latestRef.current = { value, readOnly, heightKey, onValueChange, onDebugEvent, onHeightChange, fieldProps }

  const themeName = useSelector(() => interfaceStore.resolvedTheme)

  // Built once: the frame reloads whenever its document changes
  const frameDocument = useMemo(() => buildExtensionComponentDocument(html, getExtensionComponentTheme(themeName)), [html])

  // Values come from mobx stores as proxies and props can hold functions,
  // neither can be cloned into the frame
  const post = (message: Record<string, unknown>) => {
    const plain = toPlainJson({ source: "peranti-host", ...message })
    frameRef.current?.contentWindow?.postMessage(plain, "*")
    latestRef.current.onDebugEvent?.({ direction: "out", type: String(message.type), data: plain })
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (event.source !== frameRef.current?.contentWindow || data?.source !== "peranti-component") {
        return
      }

      latestRef.current.onDebugEvent?.({ direction: "in", type: String(data.type), data })

      if (data.type === "ready") {
        isReadyRef.current = true
        const latest = latestRef.current
        post({
          type: "init",
          mode,
          value: latest.value,
          readOnly: mode === "output" || latest.readOnly,
          props: latest.fieldProps,
          theme: getExtensionComponentTheme(interfaceStore.resolvedTheme)
        })
      } else if (data.type === "change" && mode === "input" && !latestRef.current.readOnly) {
        valueFromFrameRef.current = JSON.stringify(data.value)
        latestRef.current.onValueChange?.(data.value)
      } else if (data.type === "resize" && typeof data.height === "number") {
        const nextHeight = Math.min(Math.max(Math.ceil(data.height), 0), MAX_CONTENT_HEIGHT)
        setContentHeight(nextHeight)
        if (latestRef.current.heightKey) {
          extensionComponentHeightStore.set(latestRef.current.heightKey, nextHeight)
        }
        latestRef.current.onHeightChange?.(nextHeight)
      } else if (data.type === "open-files" && Array.isArray(data.paths)) {
        // Shown as a drop: nothing is read until a tool is picked for a file
        void fileDropService.openFilesFromComponent(data.paths.filter((path: unknown): path is string => typeof path === "string"))
      }
    }

    window.addEventListener("message", handleMessage)
    return () => { window.removeEventListener("message", handleMessage) }
  }, [mode])

  // New values from the app, such as a run's output or a loaded sample
  useEffect(() => {
    // Compared as JSON, the store hands the value back wrapped in a new proxy
    if (!isReadyRef.current || JSON.stringify(value) === valueFromFrameRef.current) {
      return
    }
    post({ type: "value", value })
  }, [value])

  useEffect(() => {
    if (isReadyRef.current) {
      post({ type: "readOnly", readOnly: mode === "output" || readOnly })
    }
  }, [readOnly])

  // Theme and accent colour live on the page's root and body
  useEffect(() => {
    const sendTheme = () => {
      if (isReadyRef.current) {
        post({ type: "theme", theme: getExtensionComponentTheme(interfaceStore.resolvedTheme) })
      }
    }

    sendTheme()
    const observer = new MutationObserver(sendTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] })
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-color-scheme"] })
    return () => { observer.disconnect() }
  }, [themeName])

  // A reloaded document starts over with a handshake
  useEffect(() => {
    isReadyRef.current = false
    valueFromFrameRef.current = undefined
  }, [frameDocument])

  return (
    <div className="ExtensionComponentFrame" style={{ gridArea: fieldKey }} onContextMenu={onContextMenu}>
      <AppletComponentHead label={label} />
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
