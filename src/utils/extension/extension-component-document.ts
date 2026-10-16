import { ExtensionComponentThemeVariables } from "src/constants/extension-component-theme-variables"
import { type ResolvedTheme } from "src/enums/theme-2"
import { type ExtensionComponentFile } from "src/types/ExtensionComponentFile"
import { type ExtensionComponentTheme } from "src/types/ExtensionComponentTheme"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { getErrorMessage } from "src/utils/common/get-error-message"

import { getExtensionComponentBridgeScript } from "./extension-component-bridge.js"
import { joinRelativePaths, resolveComponentAssetPath } from "./extension-paths.js"

/**
 * The HTML document an extension component's frame shows: its own HTML with
 * its assets inlined, behind a strict content policy, with the app's theme and
 * the bridge script that gives it `window.peranti`
 */

/**
 * HTML of a component with the scripts and stylesheets it links next to it
 * written inline. The frame has no origin to load relative files from, and
 * isn't allowed to fetch anything. Links are relative to the HTML file, so a
 * build output folder works as the entry. Links outside the component stay
 * as they are and fail to load.
 */
export async function loadExtensionComponentHtml(
  { definition, path }: ExtensionComponentFile,
  folder: ExtensionFolderReader
): Promise<string> {
  // Paths are relative to the folder of the component's definition file
  const componentFolder = path.split("/").slice(0, -1).join("/")
  const readRelative = async(relativePath: string) => await folder.readText(joinRelativePaths(componentFolder, relativePath))

  let html: string
  try {
    html = await readRelative(definition.entry)
  } catch (exception) {
    const message = getErrorMessage(exception)
    throw new Error(`${path}: can't read "${definition.entry}": ${message}`)
  }

  const document = new DOMParser().parseFromString(html, "text/html")
  for (const script of Array.from(document.querySelectorAll("script[src]"))) {
    const src = resolveComponentAssetPath(definition.entry, script.getAttribute("src"))
    if (!src) continue

    const inline = document.createElement("script")
    if (script.getAttribute("type")) {
      inline.setAttribute("type", script.getAttribute("type")!)
    }
    // A closing tag inside the code would end the element early
    inline.textContent = (await readRelative(src)).replace(/<\/script/gi, "<\\/script")
    script.replaceWith(inline)
  }

  for (const link of Array.from(document.querySelectorAll("link[rel~='stylesheet'][href]"))) {
    const href = resolveComponentAssetPath(definition.entry, link.getAttribute("href"))
    if (!href) continue

    const style = document.createElement("style")
    style.textContent = await readRelative(href)
    link.replaceWith(style)
  }

  return `<!doctype html>\n${document.documentElement.outerHTML}`
}

/**
 * Current values of the theme variables, read from the page as it is drawn
 */
export function getExtensionComponentTheme(name: ResolvedTheme): ExtensionComponentTheme {
  const style = getComputedStyle(document.body)
  const variables: Record<string, string> = {}

  ExtensionComponentThemeVariables.forEach((variable) => {
    const value = style.getPropertyValue(variable).trim()
    if (value) {
      variables[variable] = value
    }
  })

  return { name, variables }
}

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
  bridge.textContent = getExtensionComponentBridgeScript()

  head.prepend(policy, style, bridge)
  document.documentElement.dataset.theme = theme.name

  return `<!doctype html>\n${document.documentElement.outerHTML}`
}
