import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { ComponentMessageType, ExtensionMessageSource, HostMessageType } from "src/constants/extension-component-protocol"
import { useSelector } from "src/hooks/useSelector"
import { extensionComponentHeightStore } from "src/services/extension-component-height-store"
import { fileDropService } from "src/services/file-drop-service"
import { interfaceStore } from "src/services/interface-store"
import { openToolService } from "src/services/open-tool-service"
import { type ExtensionComponentDebugEvent } from "src/types/ExtensionComponentDebugEvent"
import {
  type ComponentMessage,
  type ComponentMessageHandlers,
  type ExtensionComponentMode,
  type HostMessage
} from "src/types/ExtensionComponentMessage"
import { type FieldAction } from "src/types/FieldAction"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { openLink } from "src/utils/common/open-link"
import { toPlainJson } from "src/utils/data/to-plain-json"
import { buildExtensionComponentDocument, getExtensionComponentTheme } from "src/utils/extension/extension-component-document"
import { getExtensionComponentHeightKey, getExtensionIdFromComponentKey } from "src/utils/extension/extension-ids"
import { parseComponentMessage } from "src/utils/extension/parse-component-message"

const RunErrors = {
  notAvailable: "This field can't run its tool here",
  tabClosed: "The tab is closed"
}

export interface ExtensionComponentBridgeOptions {
  /**
   * Component HTML with its assets inlined
   */
  html: string
  mode: ExtensionComponentMode
  fieldKey: string

  /**
   * Names the component, see `getExtensionComponentKey`. Its last height is
   * kept under it, so the frame opens at that size
   */
  componentKey?: string

  value?: unknown
  readOnly: boolean
  isRunning: boolean

  /**
   * The field's "props" from its tool, handed to the component as is
   */
  fieldProps: Record<string, unknown>

  /**
   * What the component last saved with `peranti.setState`
   */
  initialState?: unknown

  onValueChange?: (value: unknown) => void
  onStateChange?: (state: unknown) => void
  onHeightChange?: (height: number) => void
  onDebugEvent?: (event: ExtensionComponentDebugEvent) => void

  /**
   * Runs the tool for `peranti.run(values)`. Without it, the component's call
   * fails, e.g. in the component playground
   */
  onRun?: (runValues: Record<string, unknown>) => Promise<void>
}

/**
 * The app's side of an extension component frame: builds its document, and
 * exchanges messages with the bridge script inside it, see
 * `src/constants/extension-component-protocol`.
 */
export function useExtensionComponentBridge(options: ExtensionComponentBridgeOptions) {
  const { html, mode, fieldKey, componentKey, value, readOnly, isRunning } = options

  const frameRef = useRef<HTMLIFrameElement>(null)
  const isReadyRef = useRef(false)

  // Outputs are never editable, inputs are while their tab is open
  const isReadOnly = mode === "output" || readOnly

  const heightKey = componentKey && getExtensionComponentHeightKey(componentKey, mode, fieldKey)
  const [contentHeight, setContentHeight] = useState(() => heightKey ? extensionComponentHeightStore.get(heightKey) : undefined)

  // Header buttons the component asked for with `peranti.setActions`
  const [actions, setActions] = useState<FieldAction[]>([])

  // The last value the frame sent, as JSON, so it isn't echoed straight back
  const valueFromFrameRef = useRef<string>()

  // What the component last saved: handed to it again when the frame reloads
  const savedStateRef = useRef(options.initialState)

  // The message listener is attached once, so it reads the latest options here
  const latestRef = useRef({ ...options, isReadOnly, heightKey })
  latestRef.current = { ...options, isReadOnly, heightKey }

  const themeName = useSelector(() => interfaceStore.resolvedTheme)

  // Built from the theme at the time; later theme changes are posted, so the
  // frame isn't reloaded for them
  const frameDocument = useMemo(
    () => buildExtensionComponentDocument(html, getExtensionComponentTheme(interfaceStore.resolvedTheme)),
    [html]
  )

  const post = useCallback((message: HostMessage) => {
    // Values from mobx stores are proxies and props can hold functions,
    // neither can be cloned into the frame
    const data = toPlainJson({ source: ExtensionMessageSource.Host, ...message })
    frameRef.current?.contentWindow?.postMessage(data, "*")
    latestRef.current.onDebugEvent?.({ direction: "out", type: message.type, data })
  }, [])

  /**
   * Posts only once the frame has answered the handshake
   */
  const postWhenReady = useCallback((message: HostMessage) => {
    if (isReadyRef.current) {
      post(message)
    }
  }, [post])

  // ---------------------------------------------------------------------------
  // Messages from the frame
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handlers: ComponentMessageHandlers = {
      [ComponentMessageType.Ready]: () => {
        const latest = latestRef.current
        isReadyRef.current = true

        post({
          type: HostMessageType.Init,
          mode,
          value: latest.value,
          readOnly: latest.isReadOnly,
          props: latest.fieldProps,
          state: savedStateRef.current ?? null,
          running: latest.isRunning,
          theme: getExtensionComponentTheme(interfaceStore.resolvedTheme)
        })
      },

      [ComponentMessageType.Change]: ({ value }) => {
        if (latestRef.current.isReadOnly) {
          return
        }

        valueFromFrameRef.current = JSON.stringify(value)
        latestRef.current.onValueChange?.(value)
      },

      [ComponentMessageType.Resize]: ({ height }) => {
        const { heightKey, onHeightChange } = latestRef.current

        setContentHeight(height)
        if (heightKey) {
          extensionComponentHeightStore.set(heightKey, height)
        }
        onHeightChange?.(height)
      },

      [ComponentMessageType.SetState]: ({ state }) => {
        savedStateRef.current = state
        latestRef.current.onStateChange?.(state)
      },

      [ComponentMessageType.SetActions]: ({ actions }) => {
        setActions(actions)
      },

      // Answered once the run ends, so the component's promise settles
      [ComponentMessageType.Run]: ({ runId, values }) => {
        const { onRun, isReadOnly } = latestRef.current
        const done = (error?: string) => { post({ type: HostMessageType.RunDone, runId, error }) }

        if (!onRun) {
          done(RunErrors.notAvailable)
        } else if (mode === "input" && isReadOnly) {
          done(RunErrors.tabClosed)
        } else {
          onRun(values).then(() => { done() }, (error: unknown) => { done(getErrorMessage(error)) })
        }
      },

      // The extension's own tools open right away; the service asks first for others
      [ComponentMessageType.OpenTool]: ({ toolId, values }) => {
        const { componentKey } = latestRef.current
        const extensionId = componentKey ? getExtensionIdFromComponentKey(componentKey) : undefined
        void openToolService.openFromComponent(extensionId, toolId, values)
      },

      // Shown as a drop: nothing is read until a tool is picked for a file
      [ComponentMessageType.OpenFiles]: ({ paths }) => {
        void fileDropService.openFilesFromComponent(paths)
      },

      [ComponentMessageType.OpenUrl]: ({ url }) => {
        void openLink(url)
      },

      // Replayed from the frame element, so the app's hotkeys see it as if it
      // were pressed here
      [ComponentMessageType.Key]: ({ event, init }) => {
        frameRef.current?.dispatchEvent(new KeyboardEvent(event, { ...init, bubbles: true, cancelable: true }))
      },

      // Only shown in the component playground, through `onDebugEvent`
      [ComponentMessageType.Log]: () => {}
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) {
        return
      }

      const message = parseComponentMessage(event.data)
      if (!message) {
        return
      }

      latestRef.current.onDebugEvent?.({ direction: "in", type: message.type, data: { ...message } })

      const handle = handlers[message.type] as (message: ComponentMessage) => void
      handle(message)
    }

    window.addEventListener("message", handleMessage)
    return () => { window.removeEventListener("message", handleMessage) }
  }, [mode, post])

  // ---------------------------------------------------------------------------
  // Changes from the app
  // ---------------------------------------------------------------------------

  // A reloaded document starts over with a handshake
  useEffect(() => {
    isReadyRef.current = false
    valueFromFrameRef.current = undefined
    setActions([])
  }, [frameDocument])

  // A run's output, a loaded preset, ... Compared as JSON, since the store
  // hands the value the frame just sent back wrapped in a new proxy
  useEffect(() => {
    if (JSON.stringify(value) !== valueFromFrameRef.current) {
      postWhenReady({ type: HostMessageType.Value, value })
    }
  }, [value, postWhenReady])

  useEffect(() => {
    postWhenReady({ type: HostMessageType.ReadOnly, readOnly: isReadOnly })
  }, [isReadOnly, postWhenReady])

  useEffect(() => {
    postWhenReady({ type: HostMessageType.Running, running: isRunning })
  }, [isRunning, postWhenReady])

  // The accent colour and other variables live on the page's root and body,
  // so they're sent again whenever those change
  useEffect(() => {
    const sendTheme = () => {
      postWhenReady({ type: HostMessageType.Theme, theme: getExtensionComponentTheme(interfaceStore.resolvedTheme) })
    }

    sendTheme()
    const observer = new MutationObserver(sendTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] })
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-color-scheme"] })
    return () => { observer.disconnect() }
  }, [themeName, postWhenReady])

  /**
   * A header button was clicked: the frame's `peranti.onAction` handlers get its id
   */
  const sendAction = useCallback((id: string) => {
    postWhenReady({ type: HostMessageType.Action, id })
  }, [postWhenReady])

  return { frameRef, frameDocument, contentHeight, actions, sendAction }
}
