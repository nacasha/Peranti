import { getSearchQuery } from "@codemirror/search"
import { type EditorView, type Panel } from "@uiw/react-codemirror"
import { createElement } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"

import { CodeMirrorSearchPanel } from "src/components/common/CodeMirrorSearchPanel"

/**
 * CodeMirror `search({ createPanel })` factory that renders the app's own
 * find & replace panel with React instead of the stock form.
 */
export function createSearchPanel(view: EditorView): Panel {
  const dom = document.createElement("div")
  dom.className = "cm-app-search"

  const root = createRoot(dom)
  const render = (state = view.state) => {
    root.render(createElement(CodeMirrorSearchPanel, { view, state }))
  }

  // Render synchronously so the [main-field] input exists when CodeMirror
  // looks for it to focus
  flushSync(() => { render() })

  return {
    dom,
    top: true,
    mount() {
      const input = dom.querySelector<HTMLInputElement>("[main-field]")
      input?.focus()
      input?.select()
    },
    update(update) {
      const queryChanged = !getSearchQuery(update.startState).eq(getSearchQuery(update.state))

      if (update.docChanged || update.selectionSet || queryChanged) {
        render(update.state)
      }
    },
    destroy() {
      // Unmounting while CodeMirror (or React) is mid-update warns, defer it
      queueMicrotask(() => { root.unmount() })
    }
  }
}
