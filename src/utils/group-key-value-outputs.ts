import { type AppletOutput } from "src/types/AppletOutput"

/**
 * Groups `KeyValue` output fields that share the same `props.label` so they can be
 * rendered as one card. The group sits where its first field was, every other
 * field keeps its own single-item group.
 */
export function groupKeyValueOutputs(outputs: AppletOutput[]): AppletOutput[][] {
  const groups: AppletOutput[][] = []
  const groupByLabel = new Map<string, AppletOutput[]>()

  for (const output of outputs) {
    const groupLabel = output.component === "KeyValue" ? output.props?.label : undefined

    if (!groupLabel) {
      groups.push([output])
      continue
    }

    const group = groupByLabel.get(groupLabel)
    if (group) {
      group.push(output)
    } else {
      const newGroup = [output]
      groupByLabel.set(groupLabel, newGroup)
      groups.push(newGroup)
    }
  }

  return groups
}
