import { type ExtensionComponentFile } from "src/types/ExtensionComponentFile"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"

import { resolveComponentAssetPath } from "./resolve-component-asset-path.js"

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
  const readRelative = async(relativePath: string) => {
    const segments = `${componentFolder}/${relativePath}`.split("/").filter((segment) => segment && segment !== ".")
    return await folder.readText(segments.join("/"))
  }

  let html: string
  try {
    html = await readRelative(definition.entry)
  } catch (exception) {
    const message = exception instanceof Error ? exception.message : String(exception)
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
