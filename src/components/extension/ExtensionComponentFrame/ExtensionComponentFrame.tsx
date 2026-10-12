import { useEffect, useMemo, useRef, useState, type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { buildExtensionComponentDocument } from "src/utils/build-extension-component-document"
import { getExtensionComponentTheme } from "src/utils/get-extension-component-theme"
import { toPlainJson } from "src/utils/to-plain-json"

import "./ExtensionComponentFrame.scss"

/**
 * Tallest a frame grows to by itself, so a runaway layout can't push the
 * rest of the tool away
 */
const MAX_HEIGHT = 1600

interface ExtensionComponentFrameProps {
  fieldKey: string
  label?: string
  value?: unknown
  readOnly?: boolean
  mode: "input" | "output"

  /**
   * Component HTML with its assets inlined
   */
  html: string
  defaultHeight: number
  onValueChange?: (value: unknown) => void
  onContextMenu?: any

  /**
   * The field's "props" from its tool, handed to the component as is
   */
  [prop: string]: unknown
}

/**
 * A field drawn by an extension's HTML, in a frame with no origin: it can't
 * reach the app, its storage, Tauri or the network. It only exchanges JSON
 * values with the app through messages, see `ExtensionComponentBridge`.
 */
export const ExtensionComponentFrame: FC<ExtensionComponentFrameProps> = (props) => {
  const {
    fieldKey,
    label,
    value,
    readOnly = false,
    mode,
    html,
    defaultHeight,
    onValueChange,
    onContextMenu,
    ...fieldProps
  } = props

  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(defaultHeight)
  const isReadyRef = useRef(false)

  // The last value the frame sent, as JSON, so it isn't echoed straight back
  const valueFromFrameRef = useRef<string>()

  // Read through refs, the message listener is attached once
  const latestRef = useRef({ value, readOnly, onValueChange, fieldProps })
  latestRef.current = { value, readOnly, onValueChange, fieldProps }

  const themeName = useSelector(() => interfaceStore.resolvedTheme)

  // Built once: the frame reloads whenever its document changes
  const frameDocument = useMemo(() => buildExtensionComponentDocument(html, getExtensionComponentTheme(themeName)), [html])

  // Values come from mobx stores as proxies and props can hold functions,
  // neither can be cloned into the frame
  const post = (message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(toPlainJson({ source: "peranti-host", ...message }), "*")
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (event.source !== frameRef.current?.contentWindow || data?.source !== "peranti-component") {
        return
      }

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
        setHeight(Math.min(Math.max(data.height, 24), MAX_HEIGHT))
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
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] })
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
      <div className="ExtensionComponentFrame-body">
        <iframe
          ref={frameRef}
          title={label ?? fieldKey}
          // Scripts only: no same origin, forms, popups or top navigation
          sandbox="allow-scripts"
          srcDoc={frameDocument}
          style={{ height }}
        />
      </div>
    </div>
  )
}
