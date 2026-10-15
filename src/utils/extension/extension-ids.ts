/**
 * Every ID an extension and its parts are registered under. Each is built
 * from the one before it:
 *
 *   extension  ext:github.com/owner/repo/color-kit      (ext:local/<folder> for a hand-added folder)
 *   tool       ext:github.com/owner/repo/color-kit/picker
 *   component  ext:github.com/owner/repo/color-kit#color-wheel
 *
 * IDs are scoped to the source an extension came from, so authors in
 * different catalogs can use the same names, and the `ext:` prefix keeps them
 * from ever replacing a built-in tool or component.
 */

const EXTENSION_ID_PREFIX = "ext:"

/**
 * Source key of extensions in a folder added by hand
 */
const LOCAL_SOURCE_KEY = "local"

const TOOL_SEPARATOR = "/"
const COMPONENT_SEPARATOR = "#"

/**
 * Separates the parts of a component field's height key, see
 * `getExtensionComponentHeightKey`
 */
const HEIGHT_KEY_SEPARATOR = "#"

export function getExtensionId(sourceKey: string | undefined, name: string): string {
  const scope = sourceKey === undefined || sourceKey === "" ? LOCAL_SOURCE_KEY : sourceKey
  return `${EXTENSION_ID_PREFIX}${scope}/${name}`
}

export function getExtensionToolAppletId(extensionId: string, toolId: string): string {
  return `${extensionId}${TOOL_SEPARATOR}${toolId}`
}

export function getExtensionComponentKey(extensionId: string, componentId: string): string {
  return `${extensionId}${COMPONENT_SEPARATOR}${componentId}`
}

/**
 * The extension a component key belongs to
 */
export function getExtensionIdFromComponentKey(componentKey: string): string {
  return componentKey.split(COMPONENT_SEPARATOR)[0]
}

/**
 * Whether a tool or component name belongs to an extension
 */
export function isExtensionId(name: string): boolean {
  return name.startsWith(EXTENSION_ID_PREFIX)
}

/**
 * Key a component field's last height is kept under. The mode is part of
 * it, since an input and an output may share a field key.
 */
export function getExtensionComponentHeightKey(componentKey: string, mode: string, fieldKey: string): string {
  return [componentKey, mode, fieldKey].join(HEIGHT_KEY_SEPARATOR)
}
