/**
 * Runs first inside every extension component frame. Gives the component
 * `window.peranti`, applies the app's theme, and reports the content height,
 * which is the frame's size in a layout row sized to "min-content".
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

  // The body is as tall as the frame, so its own size says nothing about the
  // content: measured from where the content ends instead, so a layout row
  // sized to "min-content" can fit it. Content that fills the body measures
  // as tall as the frame.
  //
  // Only what can be seen counts: content clipped by a scrolling or hidden
  // overflow box doesn't make the component taller, so a long list scrolling
  // in a 300px box measures 300px. Content inside a box that clips vertically
  // ends at that box, so the box is measured and its content skipped. A box
  // that only clips sideways cuts off what lies beside it.
  const range = document.createRange()
  const isVisible = (rect, clip) => (rect.width > 0 || rect.height > 0) && rect.right > clip.left && rect.left < clip.right
  const skippedTags = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"])

  const measureBottom = (parent, clip) => {
    let bottom = -Infinity
    for (let node = parent.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.data) continue
        range.selectNodeContents(node)
        const rect = range.getBoundingClientRect()
        if (isVisible(rect, clip)) bottom = Math.max(bottom, rect.bottom)
        continue
      }
      if (node.nodeType !== Node.ELEMENT_NODE || skippedTags.has(node.tagName)) continue

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
        // Nothing inside can be seen
        if (childClip.right <= childClip.left) continue
      }
      bottom = Math.max(bottom, measureBottom(node, childClip))
    }
    return bottom
  }

  let lastHeight
  let isMeasureQueued = false
  const reportHeight = () => {
    isMeasureQueued = false
    const body = document.body
    const measured = measureBottom(body, { left: -Infinity, right: Infinity })
    // No content: ends where the body's content box starts
    const contentEnd = measured === -Infinity
      ? body.getBoundingClientRect().top + (parseFloat(getComputedStyle(body).paddingTop) || 0)
      : measured
    const contentBottom = contentEnd + window.scrollY
    const paddingBottom = parseFloat(getComputedStyle(body).paddingBottom) || 0
    const height = Math.ceil(contentBottom + paddingBottom)
    if (height === lastHeight) return
    lastHeight = height
    post({ type: "resize", height })
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
    // Measured right away, the frame opens at its size without waiting a frame
    reportHeight()
    post({ type: "ready" })
  })
})()`
