import { ExtensionComponentBridge } from "src/constants/extension-component-bridge"
import { type ExtensionComponentTheme } from "src/types/ExtensionComponentTheme"

/**
 * Nothing can be loaded or fetched: no network, no Tauri IPC, no files.
 * Only the inline code and styles of the component itself run. A component
 * can't loosen it, every policy on a page applies.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:"
].join("; ")

/**
 * Document shown in a component frame: the policy, the theme and the bridge
 * go first in its head, before anything of the component. The frame
 * is as tall as the field's place in the layout, and so are `html` and
 * `body`, so the content can fill it with `height: 100%`.
 */
export function buildExtensionComponentDocument(html: string, theme: ExtensionComponentTheme): string {
  const document = new DOMParser().parseFromString(html, "text/html")
  const { head } = document

  const policy = document.createElement("meta")
  policy.setAttribute("http-equiv", "Content-Security-Policy")
  policy.setAttribute("content", CONTENT_SECURITY_POLICY)

  // Defaults the component's own styles can override
  const style = document.createElement("style")
  style.textContent = [
    `:root { color-scheme: ${theme.name}; ${Object.entries(theme.variables).map(([key, value]) => `${key}: ${value};`).join(" ")} }`,
    "html, body { height: 100%; margin: 0; background: transparent; }",
    // A component's own body padding stays inside the frame instead of
    // adding to its height and scrolling
    "body { box-sizing: border-box; }",
    "body { color: var(--text-color); font-family: var(--font-family); font-size: 13px; }"
  ].join("\n")

  const bridge = document.createElement("script")
  bridge.textContent = ExtensionComponentBridge

  head.prepend(policy, style, bridge)
  document.documentElement.dataset.theme = theme.name

  return `<!doctype html>\n${document.documentElement.outerHTML}`
}
