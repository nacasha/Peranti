/**
 * Key an extension's component is registered under. Scoped to the
 * extension, so `@color-wheel` in two extensions are two components:
 * `ext:github.com/owner/repo/color-kit#color-wheel`.
 */
export function getExtensionComponentKey(extensionId: string, componentId: string): string {
  return `${extensionId}#${componentId}`
}
