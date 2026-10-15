import {
  ComponentMessageType,
  ExtensionComponentLogLevels,
  ExtensionMessageSource,
  HostMessageType
} from "src/constants/extension-component-protocol"
import {
  type ComponentMessage,
  type ExtensionComponentLogLevel,
  type HostMessage,
  type HostMessageTypeName
} from "src/types/ExtensionComponentMessage"
import { type ExtensionComponentTheme } from "src/types/ExtensionComponentTheme"

/**
 * Names the bridge needs, handed to it as its argument since it can't import
 */
const bridgeProtocol = {
  source: ExtensionMessageSource,
  host: HostMessageType,
  component: ComponentMessageType,
  logLevels: ExtensionComponentLogLevels
}

type BridgeProtocol = typeof bridgeProtocol

type HostHandlers = {
  [Type in HostMessageTypeName]: (message: Extract<HostMessage, { type: Type }>) => void
}

/**
 * Runs first inside every extension component frame. Gives the component
 * `window.peranti`, applies the app's theme, and reports the content height.
 *
 *   peranti.mode          "input" or "output"
 *   peranti.value         current value, any JSON value
 *   peranti.readOnly      true for outputs and closed tabs
 *   peranti.props         the field's "props" from peranti.tool.json
 *   peranti.onValue(fn)   called with the value now and on every change, returns an unsubscribe
 *   peranti.setValue(v)   inputs only, sets the field's value
 *   peranti.openFiles(p)  asks to open files (absolute paths) with a tool:
 *                         Peranti shows the same picker as a file drop
 *   peranti.state         what setState last saved for this field, or null
 *   peranti.setState(s)   keeps UI state (scroll, open rows, …) with the tab, as
 *                         JSON up to 64 KB; it comes back as peranti.state when
 *                         the frame opens again, e.g. after switching tabs
 *   peranti.running       true while the tool runs
 *   peranti.onRunning(fn) called with true when a run starts and false when it
 *                         ends (and now), returns an unsubscribe
 *   peranti.openTool(id, values)
 *                         opens a tool ("json-tree-viewer", "<extension>/<tool>")
 *                         in a new tab with some inputs filled in
 *   peranti.openUrl(u)    opens an http(s) URL in the default browser
 *   peranti.setActions(a) buttons in the field header: [{ id, label?, icon?,
 *                         tooltip?, active?, disabled? }], replacing the last
 *                         list. The id "run" runs the tool
 *   peranti.onAction(fn)  called with the id of a clicked header button,
 *                         returns an unsubscribe
 *   peranti.run(values)   runs the tool. `values` (an object) go to this run
 *                         only, next to the input values, and aren't kept with
 *                         the tab. A run asked for while one is going waits for
 *                         it. Returns a promise that settles when the run ends;
 *                         the result arrives through onValue of the outputs
 *
 * IMPORTANT: this function is turned into source text with `toString()` and
 * runs inside the frame, so it must not use anything from outside its own
 * body. Type-only imports are fine, they're erased.
 */
function extensionComponentBridge(protocol: BridgeProtocol) {
  const { source, host, component, logLevels } = protocol

  type Listener<T> = (value: T) => void

  interface BridgeState {
    ready: boolean
    mode: string
    value: unknown
    readOnly: boolean
    props: Record<string, unknown>
    state: unknown
    running: boolean
  }

  const state: BridgeState = {
    ready: false,
    mode: "output",
    value: undefined,
    readOnly: true,
    props: {},
    state: null,
    running: false
  }

  const valueListeners = new Set<Listener<unknown>>()
  const runningListeners = new Set<Listener<boolean>>()
  const actionListeners = new Set<Listener<string>>()
  const pendingRuns = new Map<number, { resolve: () => void, reject: (error: Error) => void }>()
  let lastRunId = 0

  // Console methods as they were, before they're wrapped to forward their output
  const originalConsole = Object.fromEntries(
    logLevels.map((level) => [level, console[level].bind(console)])
  ) as Record<ExtensionComponentLogLevel, (...args: unknown[]) => void>

  const post = (message: ComponentMessage) => {
    window.parent.postMessage({ source: source.Component, ...message }, "*")
  }

  const notify = <T>(listeners: Set<Listener<T>>, value: T) => {
    listeners.forEach((listener) => {
      try {
        listener(value)
      } catch (error) {
        originalConsole.error(error)
      }
    })
  }

  const subscribe = <T>(listeners: Set<Listener<T>>, listener: Listener<T>, current?: () => T) => {
    listeners.add(listener)
    if (current && state.ready) {
      listener(current())
    }
    return () => { listeners.delete(listener) }
  }

  /**
   * Plain JSON copy, or undefined when the value can't be posted
   */
  const toJson = (value: unknown): unknown => {
    try {
      return JSON.parse(JSON.stringify(value ?? null))
    } catch {
      return undefined
    }
  }

  const isPlainObject = (value: unknown): value is Record<string, unknown> => (
    typeof value === "object" && value !== null && !Array.isArray(value)
  )

  // ---------------------------------------------------------------------------
  // Console output and errors, shown in the component playground
  // ---------------------------------------------------------------------------

  const describe = (value: unknown) => {
    if (typeof value === "string") return value
    if (value instanceof Error) return value.stack ?? value.message
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  const log = (level: ExtensionComponentLogLevel, args: unknown[]) => {
    try {
      post({ type: component.Log, level, message: args.map(describe).join(" ") })
    } catch {
      // Logging must never break the component
    }
  }

  logLevels.forEach((level) => {
    console[level] = (...args: unknown[]) => {
      log(level, args)
      originalConsole[level](...args)
    }
  })

  window.addEventListener("error", (event) => { log("error", [event.error ?? event.message]) })
  window.addEventListener("unhandledrejection", (event) => { log("error", ["Unhandled rejection:", event.reason]) })

  // ---------------------------------------------------------------------------
  // Shortcuts: keys pressed in the frame never reach the app, so anything with
  // Ctrl, ⌘ or ⌥, Escape and F-keys is passed up for the app's hotkeys. Read on
  // the window, last, so a key the component handled (preventDefault) stays
  // here. Modifier releases are passed too, so the app knows they're let go.
  // ---------------------------------------------------------------------------

  const modifierKeys = new Set(["Control", "Meta", "Alt", "Shift"])
  const isShortcut = (event: KeyboardEvent) => (
    event.ctrlKey || event.metaKey || event.altKey || event.key === "Escape" || /^F\d{1,2}$/.test(event.key)
  )

  const forwardKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !event.key) return

    const isModifierRelease = event.type === "keyup" && modifierKeys.has(event.key)
    if (!isShortcut(event) && !isModifierRelease) return

    post({
      type: component.Key,
      event: event.type as "keydown" | "keyup",
      init: {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        repeat: event.repeat
      }
    })
  }

  window.addEventListener("keydown", forwardKey)
  window.addEventListener("keyup", forwardKey)

  // ---------------------------------------------------------------------------
  // Messages from the app
  // ---------------------------------------------------------------------------

  const applyTheme = (theme: ExtensionComponentTheme) => {
    const root = document.documentElement
    root.dataset.theme = theme.name
    root.style.colorScheme = theme.name
    Object.entries(theme.variables).forEach(([key, value]) => { root.style.setProperty(key, value) })
  }

  const hostHandlers: HostHandlers = {
    [host.Init]: (message) => {
      state.mode = message.mode
      state.readOnly = message.readOnly
      state.props = message.props
      state.value = message.value
      state.running = message.running
      state.state = message.state ?? null
      state.ready = true
      applyTheme(message.theme)
      notify(valueListeners, state.value)
      notify(runningListeners, state.running)
    },
    [host.Value]: (message) => {
      state.value = message.value
      notify(valueListeners, state.value)
    },
    [host.ReadOnly]: (message) => {
      state.readOnly = message.readOnly
    },
    [host.Running]: (message) => {
      state.running = message.running
      notify(runningListeners, state.running)
    },
    [host.Theme]: (message) => {
      applyTheme(message.theme)
    },
    [host.RunDone]: (message) => {
      const pending = pendingRuns.get(message.runId)
      if (!pending) return

      pendingRuns.delete(message.runId)
      if (message.error) {
        pending.reject(new Error(message.error))
      } else {
        pending.resolve()
      }
    },
    [host.Action]: (message) => {
      notify(actionListeners, message.id)
    }
  }

  window.addEventListener("message", (event: MessageEvent) => {
    const data = event.data
    if (event.source !== window.parent || data?.source !== source.Host) return

    const handle = hostHandlers[data.type as HostMessageTypeName] as ((message: HostMessage) => void) | undefined
    handle?.(data)
  })

  // ---------------------------------------------------------------------------
  // The component's API
  // ---------------------------------------------------------------------------

  const peranti = Object.freeze({
    get mode() { return state.mode },
    get value() { return state.value },
    get readOnly() { return state.readOnly },
    get props() { return state.props },
    get running() { return state.running },
    get state() { return state.state },

    onValue(listener: Listener<unknown>) {
      return subscribe(valueListeners, listener, () => state.value)
    },

    setValue(value: unknown) {
      if (state.mode !== "input" || state.readOnly) return
      state.value = value
      post({ type: component.Change, value })
    },

    openFiles(paths: string | string[]) {
      const list = ([] as unknown[]).concat(paths).filter((path): path is string => typeof path === "string" && path !== "")
      if (list.length > 0) {
        post({ type: component.OpenFiles, paths: list })
      }
    },

    setState(next: unknown) {
      const plain = toJson(next)
      if (plain === undefined) return
      state.state = plain
      post({ type: component.SetState, state: plain })
    },

    onRunning(listener: Listener<boolean>) {
      return subscribe(runningListeners, listener, () => state.running)
    },

    openTool(toolId: string, values?: Record<string, unknown>) {
      const plain = toJson(values)
      if (typeof toolId !== "string" || !toolId || !isPlainObject(plain)) return
      post({ type: component.OpenTool, toolId, values: plain })
    },

    openUrl(url: string) {
      if (typeof url === "string") {
        post({ type: component.OpenUrl, url })
      }
    },

    setActions(actions: unknown) {
      const list = toJson(([] as unknown[]).concat(actions ?? []))
      post({ type: component.SetActions, actions: Array.isArray(list) ? list : [] })
    },

    onAction(listener: Listener<string>) {
      return subscribe(actionListeners, listener)
    },

    async run(values?: Record<string, unknown>) {
      const plain = toJson(values)
      if (!isPlainObject(plain)) {
        throw new Error("peranti.run: values must be a JSON object")
      }

      lastRunId += 1
      const runId = lastRunId

      await new Promise<void>((resolve, reject) => {
        pendingRuns.set(runId, { resolve, reject })
        post({ type: component.Run, runId, values: plain })
      })
    }
  })

  Object.defineProperty(window, "peranti", { value: peranti, enumerable: true })

  // ---------------------------------------------------------------------------
  // Content height
  //
  // The body is as tall as the frame, so its own size says nothing about the
  // content: it's measured from where the content ends instead, so a layout row
  // sized to "min-content" can fit it.
  //
  // Only what can be seen counts: content clipped by a scrolling or hidden
  // overflow box doesn't make the component taller, so a long list scrolling in
  // a 300px box measures 300px. A box that only clips sideways cuts off what
  // lies beside it.
  // ---------------------------------------------------------------------------

  interface HorizontalClip { left: number, right: number }

  const range = document.createRange()
  const skippedTags = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"])

  const isVisible = (rect: DOMRect, clip: HorizontalClip) => (
    (rect.width > 0 || rect.height > 0) && rect.right > clip.left && rect.left < clip.right
  )

  const measureBottom = (parent: Node, clip: HorizontalClip): number => {
    let bottom = -Infinity

    for (let node = parent.firstChild; node; node = node.nextSibling) {
      if (node instanceof Text) {
        if (!node.data) continue
        range.selectNodeContents(node)
        const rect = range.getBoundingClientRect()
        if (isVisible(rect, clip)) bottom = Math.max(bottom, rect.bottom)
        continue
      }

      if (!(node instanceof Element) || skippedTags.has(node.tagName)) continue

      const style = getComputedStyle(node)
      if (style.display === "none") continue

      const rect = node.getBoundingClientRect()
      if (isVisible(rect, clip)) bottom = Math.max(bottom, rect.bottom)

      // Its content can't show below its own box
      if (style.overflowY !== "visible") continue

      let childClip = clip
      if (style.overflowX !== "visible") {
        // Clipped to the padding box, inside the borders
        const left = rect.left + (parseFloat(style.borderLeftWidth) || 0)
        const right = rect.right - (parseFloat(style.borderRightWidth) || 0)
        childClip = { left: Math.max(clip.left, left), right: Math.min(clip.right, right) }
        if (childClip.right <= childClip.left) continue
      }

      bottom = Math.max(bottom, measureBottom(node, childClip))
    }

    return bottom
  }

  let lastHeight: number | undefined
  let isMeasureQueued = false

  const reportHeight = () => {
    isMeasureQueued = false

    const body = document.body
    const bodyStyle = getComputedStyle(body)
    const measured = measureBottom(body, { left: -Infinity, right: Infinity })

    // No content: it ends where the body's content box starts
    const contentEnd = measured === -Infinity
      ? body.getBoundingClientRect().top + (parseFloat(bodyStyle.paddingTop) || 0)
      : measured
    const height = Math.ceil(contentEnd + window.scrollY + (parseFloat(bodyStyle.paddingBottom) || 0))

    if (height === lastHeight) return
    lastHeight = height
    post({ type: component.Resize, height })
  }

  const queueMeasure = () => {
    if (isMeasureQueued) return
    isMeasureQueued = true
    requestAnimationFrame(reportHeight)
  }

  document.addEventListener("DOMContentLoaded", () => {
    new ResizeObserver(queueMeasure).observe(document.body)
    new MutationObserver(queueMeasure).observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true })
    // Images and fonts change the size without touching the DOM
    document.addEventListener("load", queueMeasure, true)

    // Measured right away, so the frame opens at its size without waiting a frame
    reportHeight()
    post({ type: component.Ready })
  })
}

/**
 * Source of the bridge script, ready to put in the frame's first `<script>`
 */
export function getExtensionComponentBridgeScript(): string {
  return `(${extensionComponentBridge.toString()})(${JSON.stringify(bridgeProtocol)})`
}
