import { type ExtensionManifest } from "src/types/ExtensionManifest"

/**
 * ID a tool of an extension is registered under. A single-tool extension
 * keeps the extension ID, so its saved tabs stay valid; a tool of a package
 * gets its tool ID appended: `ext:github.com/owner/repo/text-utils/slugify`.
 */
export function getExtensionToolAppletId(extensionId: string, manifest: ExtensionManifest, toolId: string): string {
  return manifest.tools === undefined ? extensionId : `${extensionId}/${toolId}`
}
