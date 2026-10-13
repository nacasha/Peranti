/**
 * ID an extension's tool is registered under. Scoped to where it came from,
 * so authors in different catalogs can use the same tool ID, and the `ext:`
 * prefix keeps it from ever replacing a built-in tool:
 * `ext:github.com/owner/repo/my-tool` from a catalog, `ext:local/my-folder`
 * for a folder added by hand.
 */
export function getExtensionId(sourceKey: string | undefined, name: string): string {
  return sourceKey ? `ext:${sourceKey}/${name}` : `ext:local/${name}`
}
