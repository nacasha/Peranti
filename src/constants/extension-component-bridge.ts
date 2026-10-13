/**
 * Runs first inside every extension component frame. Gives the component
 * `window.peranti`, applies the app's theme, and reports the content height.
 * Messages are tagged by side, and only messages from the parent window are
 * read.
 *
 *   peranti.mode          "input" or "output"
 *   peranti.value         current value, any JSON value
 *   peranti.readOnly      true for outputs and closed tabs
 *   peranti.props         the field's "props" from peranti.tool.json
 *   peranti.onValue(fn)   called with the value now and on every change, returns an unsubscribe
 *   peranti.setValue(v)   inputs only, sets the field's value
 */
export const ExtensionComponentBridge = `(() => {
  const state = { ready: false, mode: "output", value: undefined, readOnly: true, props: {} }
  const listeners = new Set()

  const post = (message) => {
    window.parent.postMessage(Object.assign({ source: "peranti-component" }, message), "*")
  }

  // Console output and errors go to the app too, shown in the component playground
  const describe = (value) => {
    if (typeof value === "string") return value
    if (value instanceof Error) return value.stack || value.message
    try { return JSON.stringify(value) } catch { return String(value) }
  }
  const log = (level, args) => {
    try { post({ type: "log", level, message: args.map(describe).join(" ") }) } catch {}
  }
  ;["log", "info", "warn", "error", "debug"].forEach((level) => {
    const original = console[level].bind(console)
    console[level] = (...args) => { log(level, args); original(...args) }
  })
  window.addEventListener("error", (event) => { log("error", [event.error || event.message]) })
  window.addEventListener("unhandledrejection", (event) => { log("error", ["Unhandled rejection:", event.reason]) })

  const applyTheme = (theme) => {
    if (!theme) return
    const root = document.documentElement
    root.dataset.theme = theme.name
    root.style.colorScheme = theme.name
    Object.entries(theme.variables).forEach(([key, value]) => { root.style.setProperty(key, value) })
  }

  const emit = () => {
    listeners.forEach((listener) => {
      try { listener(state.value) } catch (error) { console.error(error) }
    })
  }

  window.addEventListener("message", (event) => {
    const data = event.data
    if (event.source !== window.parent || !data || data.source !== "peranti-host") return

    if (data.type === "init") {
      state.mode = data.mode
      state.readOnly = data.readOnly
      state.props = data.props || {}
      state.value = data.value
      state.ready = true
      applyTheme(data.theme)
      emit()
    } else if (data.type === "value") {
      state.value = data.value
      emit()
    } else if (data.type === "readOnly") {
      state.readOnly = data.readOnly
    } else if (data.type === "theme") {
      applyTheme(data.theme)
    }
  })

  window.peranti = Object.freeze({
    get mode() { return state.mode },
    get value() { return state.value },
    get readOnly() { return state.readOnly },
    get props() { return state.props },
    onValue(listener) {
      listeners.add(listener)
      if (state.ready) listener(state.value)
      return () => { listeners.delete(listener) }
    },
    setValue(value) {
      if (state.mode !== "input" || state.readOnly) return
      state.value = value
      post({ type: "change", value })
    }
  })

  const reportHeight = () => {
    post({ type: "resize", height: Math.ceil(document.body.scrollHeight) })
  }

  document.addEventListener("DOMContentLoaded", () => {
    new ResizeObserver(reportHeight).observe(document.body)
    post({ type: "ready" })
  })
})()`
