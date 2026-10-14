/**
 * What an extension provides, as badge labels: "1 Tool", "3 Tools",
 * "2 Components". Empty kinds are left out.
 */
export function getExtensionProvidesLabels(toolCount: number, componentCount: number): string[] {
  const labels: string[] = []

  if (toolCount > 0) {
    labels.push(`${toolCount} ${toolCount === 1 ? "Tool" : "Tools"}`)
  }
  if (componentCount > 0) {
    labels.push(`${componentCount} ${componentCount === 1 ? "Component" : "Components"}`)
  }

  return labels
}
