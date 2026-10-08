import { type AppletComponent } from "src/models/AppletComponent"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { appletComponentService } from "src/services/applet-component-service"
import { type HistoryPreviewField } from "src/types/AppletHistory"

interface HistoryFieldSource {
  key: string
  component: string
  hideInHistory?: boolean
}

/**
 * Fields shown for a closed tab in the history list: every input, then every
 * output, except those hidden by the field (`hideInHistory`) or by their
 * component. Each is drawn by its component's `historyComponent`, or as text.
 */
export function getHistoryPreviewFields(appletConstructor: AppletConstructor | undefined): HistoryPreviewField[] {
  if (!appletConstructor) {
    return []
  }

  const resolve = (
    source: HistoryPreviewField["source"],
    fields: HistoryFieldSource[],
    components: Record<string, AppletComponent>
  ) => fields.flatMap((field): HistoryPreviewField[] => {
    const component = components[field.component]
    // A field's own setting wins, so `hideInHistory: false` can show a field
    // whose component is hidden by default
    if (!component || (field.hideInHistory ?? component.hideInHistory)) {
      return []
    }

    return [{ source, key: field.key, Component: component.historyComponent }]
  })

  // Fields built from the values are resolved with no values, as the applet
  // shows them when first opened
  const getFields = (fields: HistoryFieldSource[] | ((values: any) => HistoryFieldSource[])) => {
    if (Array.isArray(fields)) return fields

    try {
      return fields({})
    } catch {
      return []
    }
  }

  return [
    ...resolve("input", getFields(appletConstructor.inputFields), appletComponentService.inputs),
    ...resolve("output", getFields(appletConstructor.outputFields), appletComponentService.outputs)
  ]
}
