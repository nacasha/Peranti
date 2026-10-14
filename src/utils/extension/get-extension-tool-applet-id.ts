/**
 * ID a tool of an extension is registered under, the extension ID with the
 * tool ID appended: `ext:github.com/owner/repo/text-utils/slugify`
 */
export function getExtensionToolAppletId(extensionId: string, toolId: string): string {
  return `${extensionId}/${toolId}`
}
